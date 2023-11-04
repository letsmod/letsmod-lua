import { Quaternion, Vector3} from "three";
import { BodyHandle } from "../engine/BodyHandle";
import { GameplayScene } from "../engine/GameplayScene";
import { LMent } from "../engine/LMent";
import { UpdateHandler } from "../engine/MessageHandlers";
import { global, js_new } from "../js";


export class SwingMotion extends LMent implements UpdateHandler
{

	rotationAxis: Vector3;
	amplitude: number;
	frequency: number;
	phase: number;

	constructor(body: BodyHandle, id: number, params: Partial<SwingMotion> = {}) {
		super(body, id, params);
		this.rotationAxis = params.rotationAxis === undefined ? js_new(global.THREE.Vector3, 1, 0, 0) : params.rotationAxis;
		this.amplitude = params.amplitude === undefined ? 0 : params.amplitude;
		this.frequency = params.frequency === undefined ? 0 : params.frequency;
		this.phase = params.frequency === undefined ? 0 : params.frequency;
	}

	onInit() {
		GameplayScene.instance.dispatcher.addListener("update", this);
	}

	onStart() {
	}

	onUpdate(): void {
		this.runSwing();
	}

	runSwing() {
		let quat = js_new(global.THREE.Quaternion);
		let rotAxis = js_new(global.THREE.Vector3, this.rotationAxis.x, this.rotationAxis.y, this.rotationAxis.z);
		let angle = (this.amplitude * Math.sin(2 * Math.PI * this.frequency * GameplayScene.instance.memory.timeSinceStart + this.phase) * (Math.PI / 180));
		quat.setFromAxisAngle(rotAxis, angle);
		this.body.body.setRotation(quat);
	}
}