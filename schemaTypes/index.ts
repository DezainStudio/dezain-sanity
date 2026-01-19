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
import {newsroomCategory} from './newsroomCategory'
import {newsroomArticle} from './newsroomArticle'
import {trustedBy} from './trustedBy'
import {servicesOverview} from './servicesOverview'
import {sectionTitle} from './sectionTitle'
import {ctaLink} from './ctaLink'
import {iconCard} from './iconCard'
import {serviceDeliverable} from './serviceDeliverable'

export const schemaTypes = [
  // Content types
  creator,
  portfolio,
  video,
  service,
  testimonial,
  trustedBy,
  legal,
  landing,
  servicesOverview,
  newsroomArticle,
  // Taxonomies / enums (non-localized)
  skill,
  workType,
  clientType,
  serviceType,
  newsroomCategory,
  cardCarousel,
  imageCTA,
  // Shared object types
  sectionTitle,
  ctaLink,
  iconCard,
  serviceDeliverable,
  // i18n infra
  siteSettings,
  dictionary,
  glossaryTerm,
  redirect,
]
