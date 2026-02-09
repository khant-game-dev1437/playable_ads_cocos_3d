import { _decorator, Component, Vec3, Vec2, RigidBody, input, Input, EventKeyboard, KeyCode, EventTouch, Node, UITransform, view, screen, Quat, math } from 'cc';
import { PlayerCarry } from './PlayerCarry';
const { ccclass, property } = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends Component {

    @property(Node)
    public playerCharacter: Node = null;

    @property
    public rotationSpeed: number = 10;

    private _targetQuat: Quat = new Quat();
    private _currentQuat: Quat = new Quat();

    @property
    public moveSpeed: number = 5;

    @property
    public slowSpeed: number = 1;

    @property
    public slowThreshold: number = 20;

    @property
    public joystickRadius: number = 100;

    @property(Node)
    public joystickBase: Node = null;

    @property(Node)
    public joystickKnob: Node = null;

    private _keys = {};
    private _rb: RigidBody = null;
    private _playerCarry: PlayerCarry = null;

    // Touch/Joystick
    private _touchStartPos: Vec2 = new Vec2();
    private _touchCurrentPos: Vec2 = new Vec2();
    private _isTouching: boolean = false;
    private _touchId: number = -1;
    private _joystickInput: Vec2 = new Vec2();

    start() {
        this._rb = this.getComponent(RigidBody);
        this._playerCarry = this.getComponent(PlayerCarry);

        // Keyboard input
        input.on(Input.EventType.KEY_DOWN, (e) => this._keys[e.keyCode] = true, this);
        input.on(Input.EventType.KEY_UP, (e) => this._keys[e.keyCode] = false, this);

        // Touch input 
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.hideJoystick();
    }



    // Convert screen touch position to Canvas local position (center origin) must do it, if not the knob position doesnt appear on finger 
    private screenToCanvasPos(screenPos: Vec2): Vec2 {
        const visibleSize = view.getVisibleSize();
        return new Vec2(
            screenPos.x - visibleSize.width / 2,
            screenPos.y - visibleSize.height / 2
        );
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, (e) => this._keys[e.keyCode] = true, this);
        input.off(Input.EventType.KEY_UP, (e) => this._keys[e.keyCode] = false, this);

        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        if (this._isTouching) return;

        this._isTouching = true;
        this._touchId = event.touch.getID();
        this._touchStartPos = event.getUILocation();
        this._touchCurrentPos.set(this._touchStartPos);
        this._joystickInput.set(0, 0);

        this.showJoystick(this._touchStartPos);
    }

    private onTouchMove(event: EventTouch) {
        if (!this._isTouching || event.touch.getID() !== this._touchId) return;

        this._touchCurrentPos = event.getUILocation();

        //  delta from start position
        const delta = new Vec2(
            this._touchCurrentPos.x - this._touchStartPos.x,
            this._touchCurrentPos.y - this._touchStartPos.y
        );

        // Clamp to joystick radius
        const distance = delta.length();
        if (distance > this.joystickRadius) {
            delta.normalize().multiplyScalar(this.joystickRadius);
        }

        // Normalize input to -1 to 1 range
        this._joystickInput.set(
            delta.x / this.joystickRadius,
            delta.y / this.joystickRadius
        );

        this.updateJoystickVisual(delta);
    }

    private onTouchEnd(event: EventTouch) {
        if (!this._isTouching || event.touch.getID() !== this._touchId) return;

        this._isTouching = false;
        this._touchId = -1;
        this._joystickInput.set(0, 0);

        this.hideJoystick();
    }

    private showJoystick(screenPos: Vec2) {
        const canvasPos = this.screenToCanvasPos(screenPos);
        if (this.joystickBase) {
            this.joystickBase.setPosition(canvasPos.x, canvasPos.y, 0);
            this.joystickBase.active = true;
        }
        if (this.joystickKnob) {
            this.joystickKnob.setPosition(0, 0, 0);
            this.joystickKnob.active = true;
        }
    }

    private hideJoystick() {
        if (this.joystickBase) {
            this.joystickBase.active = false;
        }
        if (this.joystickKnob) {
            this.joystickKnob.active = false;
        }
    }

    private updateJoystickVisual(delta: Vec2) {
        if (this.joystickKnob) {
            this.joystickKnob.setPosition(delta.x, delta.y, 0);
        }
    }

    update(deltaTime: number) {
        if (!this._rb) return;

        let x = 0;
        let z = 0;

        // Keyboard input (WASD)
        if (this._keys[KeyCode.KEY_W]) z -= 1;
        if (this._keys[KeyCode.KEY_S]) z += 1;
        if (this._keys[KeyCode.KEY_A]) x -= 1;
        if (this._keys[KeyCode.KEY_D]) x += 1;

        // overrides keyboard if touching)
        if (this._isTouching) {
            x = this._joystickInput.x;
            z = -this._joystickInput.y; // Invert Y: screen up = move  forward -Z
        }

        let currentVelo = new Vec3();
        this._rb.getLinearVelocity(currentVelo);

        this._rb.setAngularVelocity(new Vec3(0, 0, 0));// rotation // bug fix to prevent drift. move or not, just clear angular 

        if (x !== 0 || z !== 0) {
            let speed;
            if (this._playerCarry && this._playerCarry.totalCount > this.slowThreshold) {
                speed = this.slowSpeed
            } else {
                speed = this.moveSpeed;
            }
            let move = new Vec3(x, 0, z).normalize().multiplyScalar(speed);
            this._rb.setLinearVelocity(new Vec3(move.x, currentVelo.y, move.z));

            let moveDir = new Vec3(-x, 0, -z).normalize();
            if (this.playerCharacter) {
                let angleDeg = Math.atan2(moveDir.x, moveDir.z) * (180 / Math.PI);
                this.playerCharacter.setRotationFromEuler(0, angleDeg, 0);
            }
        } else {
            this._rb.setLinearVelocity(new Vec3(0, currentVelo.y, 0)); // linear - obj pos
            
        }
    }
}