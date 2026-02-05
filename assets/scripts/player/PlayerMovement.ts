import { _decorator, Component, Vec3, RigidBody, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends Component {

    @property
    public moveSpeed: number = 5;

    private _keys = {}; 
    private _rb: RigidBody = null;

    start() {
        this._rb = this.getComponent(RigidBody);
        input.on(Input.EventType.KEY_DOWN, (e) => this._keys[e.keyCode] = true, this);
        input.on(Input.EventType.KEY_UP, (e) => this._keys[e.keyCode] = false, this);
    }

    update() {
        if (!this._rb) return;

        let x = 0;
        let z = 0;

        if (this._keys[KeyCode.KEY_W]) z -= 1;
        if (this._keys[KeyCode.KEY_S]) z += 1;
        if (this._keys[KeyCode.KEY_A]) x -= 1;
        if (this._keys[KeyCode.KEY_D]) x += 1;

        let currentVelo = new Vec3();
        this._rb.getLinearVelocity(currentVelo);

        if (x !== 0 || z !== 0) {
           
            let move = new Vec3(x, 0, z).normalize().multiplyScalar(this.moveSpeed);
            this._rb.setLinearVelocity(new Vec3(move.x, currentVelo.y, move.z));
        } else {
           
            this._rb.setLinearVelocity(new Vec3(0, currentVelo.y, 0));
            this._rb.setAngularVelocity(new Vec3(0, 0, 0));
        }
    }
}