import { VehicleType } from "../../types";

const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_FALLBACK = '/icons/drone.svg';
const ICONS_BY_VEHICLE_TYPE = new Map<VehicleType, string>([
    [VehicleType.UAS, '/icons/drone.svg'],
    [VehicleType.AIRPLANE, '/icons/aircraft.svg']
]);

export function createUASMarker(vehicleType: VehicleType, x: number, y: number): SVGSVGElement {
    const containerEl = document.createElementNS(SVG_NS, 'svg');
    containerEl.setAttribute('class', 'c-uasMarker');
    containerEl.setAttribute('width', '40');
    containerEl.setAttribute('height', '40');
    containerEl.setAttribute('x', `${x - 20}`);
    containerEl.setAttribute('y', `${y - 20}`);

    const groupEl = document.createElementNS(SVG_NS, 'g');
    groupEl.setAttribute('transform', 'translate(20, 20)')
    containerEl.appendChild(groupEl);

    const circleEl = document.createElementNS(SVG_NS, 'circle');
    circleEl.setAttribute('class', 'c-uasMarker__background');
    circleEl.setAttribute('r', '16');
    groupEl.appendChild(circleEl);

    const imageEl = document.createElementNS(SVG_NS, 'image');
    imageEl.setAttribute('class', 'c-uasMarker__icon');
    imageEl.setAttribute('href', ICONS_BY_VEHICLE_TYPE.get(vehicleType) ?? ICON_FALLBACK);
    imageEl.setAttribute('width', '24');
    imageEl.setAttribute('height', '24');
    imageEl.setAttribute('x', '-12');
    imageEl.setAttribute('y', '-12');
    groupEl.appendChild(imageEl);

    return containerEl;
}

export function updateUASMarker(containerEl: SVGSVGElement, vehicleType: VehicleType, x: number, y: number) {
    containerEl.setAttribute('x', `${x - 20}`);
    containerEl.setAttribute('y', `${y - 20}`);

    const imageEl = containerEl.querySelector('.c-uasMarker__icon');
    if (imageEl) {
        imageEl.setAttribute('href', ICONS_BY_VEHICLE_TYPE.get(vehicleType) ?? ICON_FALLBACK);
    }
}
