import { BodyHandle } from "engine/BodyHandle";
import { LMent } from "engine/LMent";

export class HazardZone extends LMent {
    public static get AllZones() { return HazardZone.zonesList;}
    private static zonesList: HazardZone[] = []
    radius: number

    onInit(): void {
        HazardZone.zonesList.push(this);
    }

    onStart(): void {
    }

    constructor(body: BodyHandle, id: number, params: Partial<HazardZone> = {}) {
        super(body, id, params);
        this.radius = params.radius === undefined?1:params.radius;
    }
}
