import {creator} from './creator'
import {portfolio} from './portfolio'
import {video} from './video'
import {skill} from './skill'
import {service} from './service'
import {workType} from './workType'
import {clientType} from './clientType'
import {legal} from './legal'
import {siteSettings} from './siteSettings'
import {dictionary} from './dictionary'
import {glossaryTerm} from './glossaryTerm'
import {redirect} from './redirect'
import {serviceType} from './serviceType'
import {testimonial} from './testimonial'
import {landing} from './landing'
import {cardCarousel} from './cardCarousel'
import {imageCTA} from './imageCTA'

export const schemaTypes = [
  // Content types
  creator,
  portfolio,
  video,
  service,
  testimonial,
  legal,
  landing,
  // Taxonomies / enums (non-localized)
  skill,
  workType,
  clientType,
  serviceType,
  cardCarousel,
  imageCTA,
  // i18n infra
  siteSettings,
  dictionary,
  glossaryTerm,
  redirect,
]
