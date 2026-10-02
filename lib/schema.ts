import { SCHEMA as OTM } from './schema.generated';
import { GYM_SCHEMA } from './schema.gym.generated';
import { GYM } from './mode';
export const SCHEMA = GYM ? GYM_SCHEMA : OTM;
