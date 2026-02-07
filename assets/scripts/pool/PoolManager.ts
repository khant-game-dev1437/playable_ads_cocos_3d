import { _decorator, Component, Node, Prefab, NodePool, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager extends Component {
    public static instance: PoolManager = null;

    // Pool Map
    private _poolMap: Map<string, NodePool> = new Map();

    onLoad() {
        PoolManager.instance = this;
    }

    public getFromPool(prefab: Prefab): Node {
        let name = prefab.name;

        if (!this._poolMap.has(name)) {
            this._poolMap.set(name, new NodePool());
        }

        let pool = this._poolMap.get(name);

        return pool.size() > 0 ? pool.get() : instantiate(prefab);
    }

    public returnToPool(node: Node) {
        let name = node.name;

        if (this._poolMap.has(name)) {
            this._poolMap.get(name).put(node);
        } else {
            node.destroy();
        }
    }
}