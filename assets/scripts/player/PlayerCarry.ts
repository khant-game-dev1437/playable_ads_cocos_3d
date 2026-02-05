import { _decorator, Collider, Component, instantiate, ITriggerEvent, Node, Prefab, Vec3 } from 'cc';
import { ObjectTag, TagType } from '../tag/ObjectTag';
const { ccclass, property } = _decorator;

@ccclass('PlayerCarry')
export class PlayerCarry extends Component {

    @property(Prefab)
    public boxPrefabA: Prefab = null; // First box type

    @property(Prefab)
    public boxPrefabB: Prefab = null; // Second box type
    
    @property(Node)
    handTransform: Node = null;

    @property
    public countInterval: number = 0.2; 

    private _currentCount: number = 0;
    private _isInArea: boolean = false;
    private _timer: number = 0;

    start() {
        const collider = this.getComponent(Collider);
        
        if(collider) {
            collider.on('onTriggerStay', this.onTriggerStay, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        }
    }

    onTriggerStay(event: ITriggerEvent) {
       
        const tag = event.otherCollider.getComponent(ObjectTag);
        
        if (tag && tag.type === TagType.GRID) {
            this._isInArea = true;
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        const tag = event.otherCollider.getComponent(ObjectTag);
        
        if (tag && tag.type === TagType.GRID) {
            this._isInArea = false;
            this._timer = 0; 
        }
    }
    
    update(deltaTime: number) {
        if (this._isInArea) {
            this._timer += deltaTime;

            if (this._timer >= this.countInterval) {
                this._currentCount++;
                this._timer = 0;
                console.log('counter' + this._currentCount);
                this.spawnBox();
            }
        }
    }

    spawnBox() {
        
        let prefabToSpawn = (this._currentCount % 2 === 0) ? this.boxPrefabA : this.boxPrefabB;

        if (prefabToSpawn) {
            let newBox = instantiate(prefabToSpawn);
           
            this.handTransform.addChild(newBox);
            newBox.setPosition(newBox.position.x,newBox.position.y+(this._currentCount*0.2), newBox.position.z);
        
        }
    }
}


