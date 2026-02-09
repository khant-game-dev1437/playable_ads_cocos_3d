import { Enum } from 'cc';

export enum PlayerCarrying {
    SQUARE,
    SPHERE,
    DROP_SQUARE,
    DROP_SPHERE,
    MONEY,
    NOTHING
}

Enum(PlayerCarrying);