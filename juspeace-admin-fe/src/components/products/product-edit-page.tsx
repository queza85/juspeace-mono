'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import {
  CircleDot,
  DollarSign,
  Hash,
  Package,
  Percent,
  Tag,
} from 'lucide-react';
import { ProductDescriptionEditor } from '@/components/products/product-add-description-field';
import { ProductImageUpload } from '@/components/products/product-add-image-upload';
import { ProductEditFormActions } from '@/components/products/product-edit-form-actions';
import {
  ProductFormField,
  ProductFormIconInput,
  ProductFormIconSelect,
  ProductFormSectionCard,
  productFormInputClassName,
} from '@/components/products/product-form-primitives';
import { ProductPageBreadcrumbs } from '@/components/products/product-page-breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { getProductBySlug } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import {
  createProductAddFormSchema,
  PRODUCT_ADD_CATEGORIES,
  PRODUCT_ADD_DISCOUNT_TYPES,
} from '@/lib/products/product-add-schema';
import { productToFormValues } from '@/lib/products/product-form-values';
import { getProductGalleryImages } from '@/lib/products/mock-data';
import { productKeys } from '@/lib/query/keys';
import { cn } from '@/lib/utils';

const detailCardClass =
  'overflow-hidden rounded-lg border border-border/60 bg-card shadow-none';

function fieldErrorText(errors: unknown[], fallback: string): string | null {
  if (!errors.length) {
    return null;
  }

  const first = errors[0];
  if (typeof first === 'string') {
    return first;
  }
  if (
    first &&
    typeof first === 'object' &&
    'message' in first &&
    typeof (first as { message: unknown }).message === 'string'
  ) {
    return (first as { message: string }).message;
  }
  return fallback;
}

function ProductEditForm({
  slug,
  product,
}: {
  slug: string;
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
}) {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const schema = useMemo(() => createProductAddFormSchema(locale), [locale]);
  const descriptionFallback = t('admin.products.detail.sampleDescriptionParagraph1');
  const defaultValues = useMemo(
    () => productToFormValues(product, descriptionFallback),
    [descriptionFallback, product],
  );
  const initialGalleryImages = useMemo(
    () => getProductGalleryImages(product.slug, product.imageUrl),
    [product.imageUrl, product.slug],
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState(initialGalleryImages);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      toast(t('admin.products.edit.submitPreview'), 'success');
      void value;
    },
  });

  const handleCancel = useCallback(() => {
    router.push(`/products/${slug}`);
  }, [router, slug]);

  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 md:py-5">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
          <div className={cn(detailCardClass, 'px-4 py-3 md:px-5')}>
            <Link
              href={`/products/${slug}`}
              className="text-sm font-medium text-[#2563eb] underline underline-offset-2 transition-colors hover:text-[#1d4ed8]"
            >
              {t('admin.products.edit.backToProduct')}
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <ProductFormSectionCard
                title={t('admin.products.edit.sections.information.title')}
                description={t('admin.products.edit.sections.information.description')}
              >
                <form.Field name="name">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-name"
                      label={t('admin.products.add.fields.name')}
                      required
                      error={fieldErrorText(
                        field.state.meta.errors,
                        t('admin.products.add.validation.nameRequired'),
                      )}
                    >
                      <input
                        id="edit-product-name"
                        value={field.state.value}
                        onChange={(event) => field.handleChange(event.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.name')}
                        aria-invalid={field.state.meta.errors.length > 0}
                        className={productFormInputClassName}
                      />
                    </ProductFormField>
                  )}
                </form.Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="sku">
                    {(field) => (
                      <ProductFormField
                        htmlFor="edit-product-sku"
                        label={t('admin.products.add.fields.sku')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.skuRequired'),
                        )}
                      >
                        <input
                          id="edit-product-sku"
                          value={field.state.value}
                          onChange={(event) => field.handleChange(event.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={t('admin.products.add.placeholders.sku')}
                          aria-invalid={field.state.meta.errors.length > 0}
                          className={productFormInputClassName}
                        />
                      </ProductFormField>
                    )}
                  </form.Field>

                  <form.Field name="stock">
                    {(field) => (
                      <ProductFormField
                        htmlFor="edit-product-stock"
                        label={t('admin.products.add.fields.stock')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.stockRequired'),
                        )}
                      >
                        <input
                          id="edit-product-stock"
                          inputMode="numeric"
                          value={field.state.value}
                          onChange={(event) => field.handleChange(event.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={t('admin.products.add.placeholders.stock')}
                          aria-invalid={field.state.meta.errors.length > 0}
                          className={productFormInputClassName}
                        />
                      </ProductFormField>
                    )}
                  </form.Field>
                </div>

                <form.Field name="description">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-description"
                      label={t('admin.products.add.fields.description')}
                      optionalLabel={t('admin.products.add.optional')}
                      error={fieldErrorText(field.state.meta.errors, '')}
                    >
                      <ProductDescriptionEditor
                        id="edit-product-description"
                        value={field.state.value ?? ''}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.description')}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                    </ProductFormField>
                  )}
                </form.Field>
              </ProductFormSectionCard>

              <ProductFormSectionCard
                title={t('admin.products.edit.sections.image.title')}
                description={t('admin.products.edit.sections.image.description')}
              >
                <ProductImageUpload
                  files={imageFiles}
                  onChange={setImageFiles}
                  existingImageUrls={existingImageUrls}
                  onExistingImageUrlsChange={setExistingImageUrls}
                />
              </ProductFormSectionCard>

              <ProductEditFormActions onCancel={handleCancel} />
            </div>

            <div className="flex flex-col gap-4">
              <ProductFormSectionCard
                title={t('admin.products.edit.sections.pricing.title')}
                description={t('admin.products.edit.sections.pricing.description')}
              >
                <form.Field name="basePrice">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-base-price"
                      label={t('admin.products.add.fields.basePrice')}
                      required
                      error={fieldErrorText(
                        field.state.meta.errors,
                        t('admin.products.add.validation.basePriceRequired'),
                      )}
                    >
                      <ProductFormIconInput
                        id="edit-product-base-price"
                        icon={<DollarSign className="size-4" aria-hidden />}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.basePrice')}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                    </ProductFormField>
                  )}
                </form.Field>

                <form.Field name="discountType">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-discount-type"
                      label={t('admin.products.add.fields.discountType')}
                      optionalLabel={t('admin.products.add.optional')}
                    >
                      <ProductFormIconSelect
                        id="edit-product-discount-type"
                        icon={<Percent className="size-4" aria-hidden />}
                        value={field.state.value ?? ''}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.discountType')}
                      >
                        {PRODUCT_ADD_DISCOUNT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {t(`admin.products.add.discountTypes.${type}`)}
                          </option>
                        ))}
                      </ProductFormIconSelect>
                    </ProductFormField>
                  )}
                </form.Field>

                <form.Field name="discountValue">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-discount-value"
                      label={t('admin.products.add.fields.discountValue')}
                      optionalLabel={t('admin.products.add.optional')}
                    >
                      <ProductFormIconInput
                        id="edit-product-discount-value"
                        icon={<Tag className="size-4" aria-hidden />}
                        value={field.state.value ?? ''}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.discountValue')}
                      />
                    </ProductFormField>
                  )}
                </form.Field>
              </ProductFormSectionCard>

              <ProductFormSectionCard
                title={t('admin.products.edit.sections.organize.title')}
                description={t('admin.products.edit.sections.organize.description')}
              >
                <form.Field name="brand">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-brand"
                      label={t('admin.products.add.fields.brand')}
                      required
                      error={fieldErrorText(
                        field.state.meta.errors,
                        t('admin.products.add.validation.brandRequired'),
                      )}
                    >
                      <ProductFormIconInput
                        id="edit-product-brand"
                        icon={<Package className="size-4" aria-hidden />}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.brand')}
                        aria-invalid={field.state.meta.errors.length > 0}
                      />
                    </ProductFormField>
                  )}
                </form.Field>

                <form.Field name="category">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-category"
                      label={t('admin.products.add.fields.category')}
                      required
                      error={fieldErrorText(
                        field.state.meta.errors,
                        t('admin.products.add.validation.categoryRequired'),
                      )}
                    >
                      <ProductFormIconSelect
                        id="edit-product-category"
                        icon={<Hash className="size-4" aria-hidden />}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.category')}
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        {PRODUCT_ADD_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {t(`admin.products.filters.categories.${category}`)}
                          </option>
                        ))}
                      </ProductFormIconSelect>
                    </ProductFormField>
                  )}
                </form.Field>

                <form.Field name="status">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-status"
                      label={t('admin.products.add.fields.status')}
                      required
                      error={fieldErrorText(
                        field.state.meta.errors,
                        t('admin.products.add.validation.statusRequired'),
                      )}
                    >
                      <ProductFormIconSelect
                        id="edit-product-status"
                        icon={<CircleDot className="size-4" aria-hidden />}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.status')}
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        <option value="DRAFT">{t('admin.products.status.DRAFT')}</option>
                        <option value="ACTIVE">{t('admin.products.status.ACTIVE')}</option>
                        <option value="ARCHIVED">
                          {t('admin.products.status.ARCHIVED')}
                        </option>
                      </ProductFormIconSelect>
                    </ProductFormField>
                  )}
                </form.Field>

                <form.Field name="tags">
                  {(field) => (
                    <ProductFormField
                      htmlFor="edit-product-tags"
                      label={t('admin.products.add.fields.tags')}
                    >
                      <ProductFormIconInput
                        id="edit-product-tags"
                        icon={<Tag className="size-4" aria-hidden />}
                        value={field.state.value ?? ''}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        placeholder={t('admin.products.add.placeholders.tags')}
                      />
                    </ProductFormField>
                  )}
                </form.Field>
              </ProductFormSectionCard>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function ProductEditSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 md:px-6 md:py-5">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
        <Skeleton className={cn(detailCardClass, 'h-12 w-full rounded-lg')} />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className={cn(detailCardClass, 'h-[520px] lg:col-span-2')} />
          <Skeleton className={cn(detailCardClass, 'h-[420px]')} />
        </div>
      </div>
    </div>
  );
}

function ProductEditPageComponent({ slug }: { slug: string }) {
  const t = useT();
  const { accessToken } = useAuth();

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug, accessToken ?? undefined),
    enabled: Boolean(slug),
  });

  const isNotFound = isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 md:-mt-6">
      <header className="border-b border-border/60 bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-bold tracking-[0.08em] text-[#111827] uppercase">
            {t('admin.products.edit.pageTitle')}
          </h1>
          <ProductPageBreadcrumbs
            currentLabelKey="admin.products.edit.breadcrumbCurrent"
            parent={{
              href: `/products/${slug}`,
              labelKey: 'admin.products.detail.breadcrumbCurrent',
            }}
          />
        </div>
      </header>

      {isLoading ? <ProductEditSkeleton /> : null}

      {!isLoading && isError ? (
        <div className="flex flex-1 flex-col px-4 py-4 md:px-6 md:py-5">
          <div
            className={cn(
              detailCardClass,
              'mx-auto w-full max-w-[1400px] px-4 py-8 text-center text-sm text-muted-foreground',
            )}
          >
            {isNotFound
              ? t('admin.products.detail.notFound')
              : t('admin.products.detail.loadError')}
          </div>
        </div>
      ) : null}

      {!isLoading && product ? (
        <ProductEditForm key={product.id} slug={slug} product={product} />
      ) : null}
    </div>
  );
}

export const ProductEditPage = memo(ProductEditPageComponent);
