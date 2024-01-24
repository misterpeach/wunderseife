<?php declare(strict_types=1);

namespace SsikMetroLight\Core\Content\Product\Cms;

use Shopware\Core\Content\Cms\Aggregate\CmsSlot\CmsSlotEntity;
use Shopware\Core\Content\Cms\DataResolver\CriteriaCollection;
use Shopware\Core\Content\Product\Cms\ProductBoxCmsElementResolver;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;

class SsikMetroProductBoxCmsElementResolver {
    /** @var ProductBoxCmsElementResolver $elementResolver */
  private $elementResolver;

  public function __construct(ProductBoxCmsElementResolver $elementResolver)
  {
    $this->elementResolver = $elementResolver;
  }

  public function getType(): string
  {
    return $this->elementResolver->getType();
  }
  
  public function collect(CmsSlotEntity $slot, ResolverContext $resolverContext): ?CriteriaCollection
  {
    $criteriaCollection = $this->elementResolver->collect($slot, $resolverContext);
    foreach ($criteriaCollection as $productCriteria) {
        foreach ($productCriteria as $criteria) {
            $criteria->addAssociation('media');
            $criteria->addAssociation('manufacturer');
        }
    }
    return $criteriaCollection;
  }

  public function enrich(CmsSlotEntity $slot, ResolverContext $resolverContext, ElementDataCollection $result): void
  {
    $this->elementResolver->enrich($slot, $resolverContext, $result);
  }

}