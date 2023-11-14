import { Quaternion, Vector3 } from "three";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { UpdateHandler } from "../engine/MessageHandlers";
import { global, js_new } from "js";
import { Helpers } from "engine/Helpers";


export class SwingMotion extends LMent implements UpdateHandler {

	rotationAxis: Vector3;
	amplitude: number;
	frequency: number;
	phase: number;
	private initRot: Quaternion | undefined;

	constructor(body: BodyHandle, id: number, params: Partial<SwingMotion> = {}) {
		super(body, id, params);
		this.rotationAxis = params.rotationAxis === undefined ? js_new(global.THREE.Vector3, 1, 0, 0) : params.rotationAxis;
		this.amplitude = params.amplitude === undefined ? 90 : params.amplitude;
		this.frequency = params.frequency === undefined ? 1 : params.frequency;
		this.phase = params.frequency === undefined ? 0 : params.frequency;
	}

	onInit() {
		GameplayScene.instance.dispatcher.addListener("update", this);
	}

	onStart() {
		this.initRot = this.body.body.getRotation().clone();
	}

	onUpdate(): void {
		this.runSwing();
	}

	runSwing() {
		let rotAxis = Helpers.NewVector3(this.rotationAxis.x, this.rotationAxis.y, this.rotationAxis.z);
		let angle = (this.amplitude * Math.sin(2 * Math.PI * this.frequency * GameplayScene.instance.memory.timeSinceStart + this.phase) * (Math.PI / 180));
		let eulerRot = Helpers.NewQuatFromEuler(rotAxis.x * angle, rotAxis.y * angle, rotAxis.z * angle)
		if(this.initRot !== undefined)
			this.body.body.setRotation(this.initRot.clone().multiply(eulerRot));
	}
}