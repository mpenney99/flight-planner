import { useCallback, useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { flightConfigAtomFamily } from '../../atoms';
import distance from '@turf/distance';
import { axisBottom, axisLeft } from 'd3-axis';
import { drag } from 'd3-drag';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { Point } from '../../types';
import { pointToGeoPosition } from '../../utils/geoUtils';

type Props = {
    flightId: string;
};

const MARGIN_LEFT = 45;
const MARGIN_BOTTOM = 45;
const MARGIN_RIGHT = 30;
const MARGIN_TOP = 30;

type DataPoint = {
    index: number;
    x: number;
    y: number;
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

const getXScale = (points: DataPoint[], width: number) => {
    const domain = range(points, (point) => point.x);
    return scaleLinear()
        .domain(domain)
        .range([MARGIN_LEFT, width - MARGIN_RIGHT]);
};

const getYScale = (points: DataPoint[], height: number) => {
    const domain = range(points, (point) => point.y);
    domain[0] = Math.min(0, domain[0]);
    domain[1] = Math.max(50, domain[1]);
    return scaleLinear()
        .domain([domain[1], domain[0]])
        .range([MARGIN_TOP, height - MARGIN_BOTTOM]);
};

const pathToDataPoints = (path: Point[]): DataPoint[] => {
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
            y: point.alt
        };
    });
}

export function AltitudeProfile({ flightId }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [config, setConfig] = useRecoilState(flightConfigAtomFamily(flightId));
    const path = config.path;

    const onPathChanged = useCallback((path: Point[]) => {
        setConfig((config) => ({ ...config, path }));
    }, [setConfig]);

    // create the graph
    useEffect(() => {
        const container = containerRef.current!;

        // create root SVG
        const $svg = select(container)
            .append('svg');

        // create x-label
        $svg.append('g')
            .attr('class', 'graph__xLabel')
            .append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .text('Distance (meters)');

        // create y-label
        $svg.append('g')
            .attr('class', 'graph__yLabel')
            .append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('transform', rotate(-90))
                .text('Altitude (meters)');

        // create x-axis
        $svg.append('g')
            .attr('class', 'graph__xAxis');

        // create y-axis
        $svg.append('g')
            .attr('class', 'graph__yAxis');

        // create path
        $svg.append('path')
            .attr('class', 'graph__line')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none');

        // destroy the graph on unmount
        return () => {
            $svg.node()?.remove();
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current!;
        const { width, height } = container.getBoundingClientRect();
        const dataPoints = pathToDataPoints(path);
        const xScale = getXScale(dataPoints, width);
        const yScale = getYScale(dataPoints, height);

        // update root SVG
        const $svg = select(container).select('svg')
            .attr('width', width)
            .attr('height', height);

        // update x-label
        $svg.select<SVGGElement>('.graph__xLabel')
        .attr('transform', translate(width / 2, height - 15));

        // update y-label
        $svg.select<SVGGElement>('.graph__yLabel')
            .attr('transform', translate(15, height / 2))

        // update x-axis
        $svg.select<SVGGElement>('.graph__xAxis')
            .attr('transform', translate(0, height - MARGIN_BOTTOM))
            .call(axisBottom(xScale));

        // update y-axis
        $svg.select<SVGGElement>('.graph__yAxis')
            .attr('transform', translate(MARGIN_LEFT, 0))
            .call(axisLeft(yScale));

        // updates the line on the graph
        const updateLine = () => {
            $svg.select<SVGPathElement>('.graph__line')
                .datum(dataPoints)
                .attr('d', line<DataPoint>()
                    .x((d) => xScale(d.x))
                    .y((d) => yScale(d.y))
                );
        }

        // updates the points on the graph
        const updateDataPoints = () => {
            drag<SVGCircleElement, DataPoint>()
                .on('drag', function(event, dataPoint) {
                    dataPoint.y = yScale.invert(yScale(dataPoint.y) + event.dy);
                });

            $svg.selectAll<SVGCircleElement, DataPoint>('.graph__point')
                .data(dataPoints)
                .join('circle')
                    .attr('class', 'graph__point')
                    .attr('r', 7)
                    .attr('cx', (point) => xScale(point.x))
                    .attr('cy', (point) => yScale(point.y))
                    // setup drag behaviour
                    .call(drag<SVGCircleElement, DataPoint>()
                        .on('drag', function(event, dataPoint) {
                            dataPoint.y = yScale.invert(yScale(dataPoint.y) + event.dy);
                            this.setAttribute('cy', yScale(dataPoint.y) + 'px');
                            updateLine();
                        })
                        .on('end', (_event, dataPoint) => {
                            const nextPath = path.map((point, i) => i === dataPoint.index ? ({ ...point, alt: dataPoint.y }) : point);
                            onPathChanged(nextPath);
                        })
                    );
        }

        updateLine();
        updateDataPoints();
    }, [path, onPathChanged]);

    return (
        <div className="c-altitudeProfile">
            <div ref={containerRef} className="c-altitudeProfile__graph"/>
        </div>
    );
}
