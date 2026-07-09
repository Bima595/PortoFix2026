import { type SchemaTypeDefinition } from 'sanity'

import {bioType} from './bioType'
import {workExperienceType} from './workExperienceType'
import {RewardType} from './RewardType'
import {SideProjectType} from './SideProjectType'
import {EducationType} from './EducationType'
import {CertificateType} from './CertificateType'
import {SkillType} from './SkillType'
import {statsType} from './statsType'
import {projectType} from './projectType'
import {fieldType} from './fieldType'
import {pricingType} from './pricingType'
import {photoboothTemplateType} from './photoboothTemplateType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    bioType, 
    workExperienceType, 
    RewardType, 
    SideProjectType, 
    EducationType, 
    CertificateType, 
    SkillType,
    statsType,
    projectType,
    fieldType,
    pricingType,
    photoboothTemplateType,
  ],
}
