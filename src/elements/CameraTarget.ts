import { BodyHandle } from "engine/BodyHandle";
import { GameplayScene } from "engine/GameplayScene";
import { LMent } from "engine/LMent";
import { DragGestureHandler, UpdateHandler } from "engine/MessageHandlers";
import { GuideBody } from "./GuideBody";
import { Helpers } from "engine/Helpers";

export class CameraTarget extends LMent implements UpdateHandler, DragGestureHandler {

    dragSpeed: number;
    maxCamDrag: { x: number; y: number; z: number; };
    minCamDrag: { x: number; y: number; z: number; };
    private currentCamDrag = Helpers.zeroVector;



    private cameraLead: GuideBody | undefined;

    private dragDx: number = 0;
    private dragDy: number = 0;

    constructor(body: BodyHandle, id: number, params: Partial<CameraTarget> = {}) {
        super(body, id, params);
        this.maxCamDrag = params.maxCamDrag === undefined ? { x: 0, y: 0, z: 0 } : params.maxCamDrag;
        this.minCamDrag = params.minCamDrag === undefined ? { x: 0, y: 0, z: 0 } : params.minCamDrag;
        this.dragSpeed = params.dragSpeed === undefined ? 0 : params.dragSpeed;
    }

    onInit(): void {
        GameplayScene.instance.dispatcher.addListener("update", this);
        GameplayScene.instance.dispatcher.addListener("drag", this);
        GameplayScene.instance.memory.player = this.body;
    }

    onStart(): void {
        this.initCamera()
        this.initBodyGuides();
    }

    onDrag(dx: number, dy: number): void {
        this.dragDx = dx;
        this.dragDy = dy;
    }

    onUpdate(): void {
        this.updateCameraDrag();
        this.belowZeroCheck();
    }

    initCamera() {
        if (GameplayScene.instance.memory.mainCamera !== undefined)
            return;
        let cameraInstance = GameplayScene.instance.clonePrefab("Player Camera");
        if (cameraInstance !== undefined) {
            cameraInstance.body.setPosition(Helpers.forwardVector.multiplyScalar(-2).add(this.body.body.getPosition()));
            GameplayScene.instance.memory.mainCamera = cameraInstance;
            if (GameplayScene.instance.clientInterface !== undefined)
                GameplayScene.instance.clientInterface.setCamera(cameraInstance.body.id);
        }
    }

    initBodyGuides() {
        let elements = this.body.getAllElements(GuideBody);
        let guideFound = false;
        for (let e of elements) {
            if (e !== undefined && e.guideName === "MainCamera") {
                this.cameraLead = e;
                guideFound = true;
            }
        }
        if (!guideFound)
            console.error("No GuideBody LMent with MainCamera name is found.");
    }

    updateCameraDrag() {
        if (this.cameraLead === undefined) return;
        if (this.dragDx != 0 || this.dragDy != 0) {
            if (this.dragDx > 0)
                this.currentCamDrag.x = Helpers.NumLerp(this.currentCamDrag.x, -this.maxCamDrag.x, this.dragSpeed);
            else if (this.dragDx < 0)
                this.currentCamDrag.x = Helpers.NumLerp(this.currentCamDrag.x, this.minCamDrag.x, this.dragSpeed);
            else this.currentCamDrag.x = Helpers.NumLerp(this.currentCamDrag.x, 0, 0.15);

            if (this.dragDy > 0)
                this.currentCamDrag.z = Helpers.NumLerp(this.currentCamDrag.z, -this.maxCamDrag.z, this.dragSpeed);
            else this.currentCamDrag.z = Helpers.NumLerp(this.currentCamDrag.z, this.minCamDrag.z, this.dragSpeed);
            console.log("currentz:" + this.currentCamDrag.z);
            console.log("maxZ:" + this.maxCamDrag.z);
            console.log("dragDy:" + this.dragDy);
        }
        this.cameraLead.updateOffsetVector(this.currentCamDrag.x, this.currentCamDrag.y, this.currentCamDrag.z, true);
    }

    belowZeroCheck() {
        if (this.body.body.getPosition().y < 1 && this.cameraLead !== undefined)
            this.cameraLead.enabled = false;
    }
}