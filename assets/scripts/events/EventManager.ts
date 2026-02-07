import { _decorator, Component, Node, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventManager')
export class EventManager extends Component {
    private static _instance: EventTarget = new EventTarget();

    public static get instance(): EventTarget {
        return this._instance;
    }

    public static readonly EVENT_SCREEN_RESIZE = 'EVENT_SCREEN_RESIZE';
    
    // Game
    public static readonly PLAYER_RECEIVE_ITEM = 'PLAYER_RECEIVE_ITEM';
    public static readonly GRID_FULL = 'GRID_FULL'; 
}


