import { _decorator, Component, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum TagType {
    PLAYER,
    GRID
}
Enum(TagType);

@ccclass('ObjectTag')
export class ObjectTag extends Component {
    @property({ type: TagType })
    public type: TagType = TagType.PLAYER;
}