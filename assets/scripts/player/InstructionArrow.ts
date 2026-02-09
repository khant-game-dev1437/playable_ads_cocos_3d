import { _decorator, Component, Node, Vec3, tween, director } from 'cc';
import { GridData } from '../world/GridData';
import { PlayerCarrying } from '../enums/Enums';

const { ccclass, property } = _decorator;

@ccclass('InstructionArrow')
export class InstructionArrow extends Component {

    @property
    public orbitDistance: number = 1.5;

    @property
    public disappearDistance: number = 3;

    @property
    public rotationOffset: number = 180;

    private _grids: Node[] = [];
    private _hidden: boolean = false;
    private _playerNode: Node = null;
    private _gridsFound: boolean = false;

    start() {
        this._playerNode = this.node.parent;
    }

    private findGrids() {
        const scene = director.getScene();
        const allGrids = scene.getComponentsInChildren(GridData);
        for (const grid of allGrids) {
            if (grid.itemType === PlayerCarrying.SQUARE || grid.itemType === PlayerCarrying.SPHERE) { // pickup zoen only
                this._grids.push(grid.node);
            }
        }
        this._gridsFound = true;
    }

    update(deltaTime: number) {
        if (this._hidden || !this._gridsFound) {
            if (!this._gridsFound) this.findGrids();
            return;
        }

        if (this._grids.length === 0) return;

        const playerPos = this._playerNode.worldPosition;
        let nearestDist = Infinity;
        let nearest: Node = null;

        // Find nearest grid
        for (const grid of this._grids) {
            const dist = Vec3.distance(playerPos, grid.worldPosition);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = grid;
            }
        }

        if (!nearest) return;

        const targetPos = nearest.worldPosition.clone();
        const dir = new Vec3();
        Vec3.subtract(dir, targetPos, playerPos);
        dir.y = 0;
        dir.normalize(); // only direction

        const localOffset = new Vec3(dir.x * this.orbitDistance, 0, dir.z * this.orbitDistance);

        const arrowWorldPos = new Vec3();
        Vec3.add(arrowWorldPos, playerPos, localOffset);
        arrowWorldPos.y = playerPos.y + 1.0;
        this.node.setWorldPosition(arrowWorldPos);

        this.node.lookAt(targetPos);

        if (this.rotationOffset !== 0) {
            const euler = this.node.eulerAngles;
            this.node.setRotationFromEuler(euler.x, euler.y + this.rotationOffset, euler.z);
        }

        // Distance Check
        if (nearestDist < this.disappearDistance) {
            this.hideArrow();
        }
    }

    private hideArrow() {
        this._hidden = true;
        tween(this.node)
            .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'sineIn' })
            .call(() => { this.node.active = false; })
            .start();
    }
}
