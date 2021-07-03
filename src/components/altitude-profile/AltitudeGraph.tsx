import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { flightConfigAtomFamily, uasAtomFamily } from '../../atoms';
import distance from '@turf/distance';
import { Point, UASState } from '../../types';
import { getUASStateAlongPath, pointToGeoPosition } from '../../utils/geoUtils';
import { Tooltip } from './Tooltip';

// d3 imports
import { select, pointer } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { drag } from 'd3-drag';
import { createUASMarker, updateUASMarker } from '../map/uasPainter';

type Props = {
    flightId: string;
};

const MARGIN_LEFT = 50;
const MARGIN_BOTTOM = 50;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 10;

type PathNodeDatum = {
    index: number;
    x: number;
    y: number;
    point: Point;
};

type TooltipState = {
    xPos: number;
    yPos: number;
    fields: [string, string | number][];
};

const translate = (x: number, y: number) => `translate(${x},${y})`;

const rotate = (angle: number) => `rotate(${angle})`;

function range<T>(points: T[], fn: (point: T) => number): [number, number] {
    let min = 0;
    let max = 0;
    for (let i = 0; i < points.length; i++) {
        const value = fn(points[i]);
        if (i === 0) {
            min = value;
            max = value;
        } else {
            min = Math.min(min, value);
            max = Math.max(max, value);
        }
    }
    return [min, max];
}

const getXScale = (points: PathNodeDatum[], width: number) => {
    const domain = range(points, (point) => point.x);
    return scaleLinear()
        .domain(domain)
        .range([MARGIN_LEFT, width - MARGIN_RIGHT]);
};

const getYScale = (points: PathNodeDatum[], height: number) => {
    const domain = range(points, (point) => point.y);
    domain[0] = Math.min(0, domain[0]);
    domain[1] = Math.max(50, domain[1]);
    return scaleLinear()
        .domain([domain[1], domain[0]])
        .range([MARGIN_TOP, height - MARGIN_BOTTOM]);
};

const pathToData = (path: Point[]): PathNodeDatum[] => {
    let dist = 0;
    return path.map((point, i, path) => {
        if (i > 0) {
            const from = pointToGeoPosition(path[i - 1]);
            const to = pointToGeoPosition(path[i]);
            dist += distance(from, to, { units: 'meters' });
        }

        return {
            index: i,
            x: dist,
            y: point.alt,
            point
        };
    });
}

const uasStateToUases = (uasState: UASState | null): UASState[] => {
    return uasState ? [{ ...uasState }] : [];
}

const pathNodeTooltipFields = (datum: PathNodeDatum): [string, string | number][] => {
    return [
        ['alt', datum.point.alt.toFixed(2)],
        ['lon', datum.point.lon.toFixed(8)],
        ['lat', datum.point.lat.toFixed(8)]
    ];
}

const uasTooltipFields = (datum: UASState): [string, string | number][] => {
    return [
        ['distance', datum.distanceTravelled.toFixed(2)],
        ['alt', datum.position.alt.toFixed(2)],
        ['lon', datum.position.lon.toFixed(8)],
        ['lat', datum.position.lat.toFixed(8)]
    ];
}

export function AltitudeGraph({ flightId }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [tooltip, setTooltip] = useState<TooltipState>();
    const [config, setConfig] = useRecoilState(flightConfigAtomFamily(flightId));
    const [uasState, setUasState] = useRecoilState(uasAtomFamily(flightId));
    const path = config.path;

    const onPathChanged = useCallback((path: Point[]) => {
        setConfig((config) => ({ ...config, path }));
    }, [setConfig]);

    // create the graph
    useEffect(() => {
        const svg = svgRef.current!;

        // select the SVG element
        const $svg = select(svg);

        // create x-label
        $svg.append('g')
            .attr('class', 'c-graph__label c-graph__label--x')
            .append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .text('Distance (meters)');

        // create y-label
        $svg.append('g')
            .attr('class', 'c-graph__label c-graph__label--y')
            .append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('transform', rotate(-90))
                .text('Altitude (meters)');

        // create x-axis
        $svg.append('g')
            .attr('class', 'c-graph__axis c-graph__axis--x');

        // create y-axis
        $svg.append('g')
            .attr('class', 'c-graph__axis c-graph__axis--y');

        // create grid-lines
        $svg.append('g')
            .attr('class', 'c-graph__gridLines');

        // create path
        $svg.append('path')
            .attr('class', 'c-graph__line')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none');

        // create points container
        $svg.append('g')
            .attr('class', 'c-graph__pointContainer');

        // create uas marker container
        $svg.append('g')
            .attr('class', 'c-graph__uasContainer');

        // destroy the graph on unmount
        return () => {
            const nodes = Array.from(svg.childNodes);
            nodes.forEach(node => node.remove());
        }
    }, []);

    // update the graph
    useEffect(() => {
        const container = containerRef.current!;
        const svg = svgRef.current!;

        const { width, height } = container.getBoundingClientRect();
        const data = pathToData(path);
        const uases = uasStateToUases(uasState);
        const xScale = getXScale(data, width);
        const yScale = getYScale(data, height);

        // select the SVG element
        const $svg = select(svg);

        // update x-label
        $svg.select<SVGGElement>('.c-graph__label--x')
        .attr('transform', translate(width / 2, height - 15));

        // update y-label
        $svg.select<SVGGElement>('.c-graph__label--y')
            .attr('transform', translate(15, height / 2))

        // update x-axis
        $svg.select<SVGGElement>('.c-graph__axis--x')
            .attr('transform', translate(0, height - MARGIN_BOTTOM))
            .call(axisBottom(xScale));

        // update y-axis
        $svg.select<SVGGElement>('.c-graph__axis--y')
            .attr('transform', translate(MARGIN_LEFT, 0))
            .call(axisLeft(yScale));

        // update grid-lines
        $svg.select<SVGGElement>('.c-graph__gridLines')
            .attr('transform', translate(MARGIN_LEFT, 0))   
            .call(axisLeft(yScale).tickSize((MARGIN_LEFT + MARGIN_RIGHT) - width).tickFormat('' as any))

        const updateLine = () => {
            $svg.select<SVGPathElement>('.c-graph__line')
                .datum(data)
                .attr('d', line<PathNodeDatum>()
                    .x((d) => xScale(d.x))
                    .y((d) => yScale(d.y))
                );
        }

        const updatePathNodeFromDatum = (el: SVGCircleElement, datum: PathNodeDatum) => {
            el.setAttribute('cy', yScale(datum.y) + 'px');
        };

        const updatePoints = () => {
            $svg.select('.c-graph__pointContainer')
                .selectAll<SVGCircleElement, PathNodeDatum>('.c-graph__point')
                .data(data)
                .join('circle')
                    .attr('class', 'c-graph__point')
                    .attr('r', 7)
                    .attr('cx', (point) => xScale(point.x))
                    .attr('cy', (point) => yScale(point.y))
                    .call(drag<SVGCircleElement, PathNodeDatum>() // setup drag behaviour
                        .on('drag', function(event, datum) {
                            datum.y = yScale.invert(yScale(datum.y) + event.dy);

                            updatePathNodeFromDatum(this, datum);
                            
                            // update the tooltip
                            const [xPos, yPos] = pointer(event, container);
                            setTooltip({ xPos, yPos, fields: pathNodeTooltipFields(datum) });
                            updateLine();
                        })
                        .on('end', (_event, datum) => {
                            // update recoil state
                            const altitude = Math.round(datum.y);
                            const nextPath = path.map((point, i) => i === datum.index ? ({ ...point, alt: altitude }) : point);
                            onPathChanged(nextPath);

                            // hide the tooltip
                            setTooltip(undefined);
                        })
                    )
                    // show / hide the tooltip
                    .on('mousemove', function(event, datum) {
                        const [xPos, yPos] = pointer(event, container);
                        setTooltip({ xPos, yPos, fields: pathNodeTooltipFields(datum) });
                    })
                    .on('mouseout', function() {
                        setTooltip(undefined);
                    });
        }

        const updateUASMarkerFromDatum = (el: SVGSVGElement, datum: UASState) => {
            const x = xScale(datum.distanceTravelled);
            const y = yScale(datum.position.alt);
            updateUASMarker(el, datum.vehicleType, x, y);
        };

        // update the uas position on the graph
        const updateUAS = () => {
            $svg.select('.c-graph__uasContainer')
                .selectAll<SVGSVGElement, UASState>('.c-uasMarker')
                .data(uases)
                .join(
                    enter => enter.append((datum) => {
                        const x = xScale(datum.distanceTravelled);
                        const y = yScale(datum.position.alt);
                        return createUASMarker(datum.vehicleType, x, y);
                    }),
                    update => update.each(function(datum) {
                        updateUASMarkerFromDatum(this, datum);
                    })
                )
                .call(drag<SVGSVGElement, UASState>()
                    .on('drag', function(event, datum) {
                        // clamp the distance-travelled between the graph extents
                        let distanceTravelled = xScale.invert(xScale(datum.distanceTravelled) + event.dx);
                        distanceTravelled = Math.max(distanceTravelled, data[0].x);
                        distanceTravelled = Math.min(distanceTravelled, data[data.length - 1].x);

                        updateUASMarkerFromDatum(this, datum);

                        // update the tooltip
                        const [xPos, yPos] = pointer(event, container);
                        Object.assign(datum, getUASStateAlongPath(distanceTravelled, path, datum.vehicleType));
                        setTooltip({ xPos, yPos, fields: uasTooltipFields(datum) });
                    })
                    .on('end', (_event, datum) => {
                        // update recoil state
                        setUasState({ ...datum });

                        // hide the tooltip
                        setTooltip(undefined);
                    })
                )
                // show / hide the tooltip
                .on('mousemove', function(event, datum) {
                    const [xPos, yPos] = pointer(event, container);
                    setTooltip({ xPos, yPos, fields: uasTooltipFields(datum) });
                })
                .on('mouseout', function() {
                    setTooltip(undefined);
                });
        }

        updateLine();
        updatePoints();
        updateUAS();
    }, [path, uasState, onPathChanged, setUasState]);

    return (
        <div className="c-altitudeProfile">
            <h4 className="text-center mb-0">Altitude Profile</h4>
            <div ref={containerRef} className="c-graph__container">
                <svg ref={svgRef} className="c-graph" width="450" height="300"/>
                {tooltip && <Tooltip {...tooltip} containerRef={containerRef} />}
            </div>
        </div>
    );
}
