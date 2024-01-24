<?php declare(strict_types=1);

namespace SsikMetroLight\Storefront\Controller;

use Shopware\Core\PlatformRequest;
use Shopware\Core\Framework\Log\Package;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Shopware\Storefront\Controller\StorefrontController;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Framework\Routing\RequestTransformer;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\Checkout\Customer\SalesChannel\AbstractLoginRoute;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Shopware\Core\Checkout\Customer\Exception\BadCredentialsException;
use Shopware\Core\Checkout\Customer\Exception\CustomerNotFoundException;
use Shopware\Storefront\Checkout\Cart\SalesChannel\StorefrontCartFacade;
use Shopware\Core\Checkout\Customer\Exception\CustomerAuthThrottledException;
use Shopware\Core\Framework\RateLimiter\Exception\RateLimitExceededException;
use Shopware\Core\Checkout\Customer\Exception\CustomerOptinNotCompletedException;
use Shopware\Core\System\SalesChannel\Context\SalesChannelContextServiceInterface;
use Shopware\Core\System\SalesChannel\Context\SalesChannelContextServiceParameters;
use Shopware\Core\Checkout\Customer\SalesChannel\AbstractSendPasswordRecoveryMailRoute;
use Shopware\Core\Framework\DataAbstractionLayer\Exception\InconsistentCriteriaIdsException;
use Shopware\Core\System\SalesChannel\Aggregate\SalesChannelDomain\SalesChannelDomainEntity;
use Symfony\Component\Validator\Constraints\Choice;

#[Route(defaults: ['_routeScope' => ['storefront']])]
#[Package('storefront')]
class SsikSimpleLoginController extends StorefrontController
{
   
    /**
     * @internal
     */
    public function __construct(
        private readonly AbstractSendPasswordRecoveryMailRoute $sendPasswordRecoveryMailRoute,
        private readonly AbstractLoginRoute $loginRoute, 
        private readonly StorefrontCartFacade $cartFacade, 
        private readonly SalesChannelContextServiceInterface $salesChannelContext)
    {
    }

    #[Route(path: '/ssik/login', name: 'ssik.login', options: ['seo' => false], defaults: ['XmlHttpRequest' => true], methods: ['POST'])]
    public function login(Request $request, RequestDataBag $data, SalesChannelContext $context): JsonResponse
    {
        try {
            
            $token = $this->loginRoute->login($data, $context)->getToken();
            
            $cartBeforeNewContext = $this->cartFacade->get($token, $context);

            $newContext = $this->salesChannelContext->get(
                new SalesChannelContextServiceParameters(
                    $context->getSalesChannelId(),
                    $token,
                    $context->getLanguageIdChain()[0],
                    $context->getCurrencyId(),
                    $context->getDomainId(),
                    $context->getContext()
                )
            );

            // Update the sales channel context for CacheResponseSubscriber
            $request->attributes->set(PlatformRequest::ATTRIBUTE_SALES_CHANNEL_CONTEXT_OBJECT, $newContext);
            if (!empty($token)) {
                $this->addCartErrors($cartBeforeNewContext);
                return new JsonResponse(['success' => true]);
            }
        } catch (BadCredentialsException | UnauthorizedHttpException | CustomerOptinNotCompletedException | CustomerAuthThrottledException $e) {
            return new JsonResponse(['errors' => true]);
        }
         
    }

    #[Route(path: '/ssik/recovery', name: 'ssik.recovery', options: ['seo' => false], defaults: ['XmlHttpRequest' => true], methods: ['POST'])]
    public function recovery(Request $request, RequestDataBag $data, SalesChannelContext $context): JsonResponse
    {
        try {

            $data->get('email')
                ->set('storefrontUrl', $request->attributes->get(RequestTransformer::STOREFRONT_URL));

            $this->sendPasswordRecoveryMailRoute->sendRecoveryMail(
                $data->get('email')->toRequestDataBag(),
                $context,
                false
            );

            return new JsonResponse(['success' => true]);
        }
        catch (RateLimitExceededException | InconsistentCriteriaIdsException | CustomerNotFoundException $e) {
            return new JsonResponse(['errors' => true]);
        }
    }   

    private function getDomainUrls(SalesChannelContext $context): array
    {
        $salesChannelDomainCollection = $context->getSalesChannel()->getDomains();
        if ($salesChannelDomainCollection === null) {
            return [];
        }

        return array_map(static fn (SalesChannelDomainEntity $domainEntity) => rtrim($domainEntity->getUrl(), '/'), $salesChannelDomainCollection->getElements());
    }
}
