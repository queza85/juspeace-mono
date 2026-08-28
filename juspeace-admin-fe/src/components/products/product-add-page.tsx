'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import {
  CircleDot,
  DollarSign,
  Hash,
  Package,
  Percent,
  Tag,
} from 'lucide-react';
import { ProductAddFormActions } from '@/components/products/product-add-form-actions';
import { ProductDescriptionEditor } from '@/components/products/product-add-description-field';
import { ProductImageUpload } from '@/components/products/product-add-image-upload';
import {
  ProductFormField,
  ProductFormIconInput,
  ProductFormIconSelect,
  ProductFormSectionCard,
  productFormInputClassName,
} from '@/components/products/product-form-primitives';
import { ProductPageBreadcrumbs } from '@/components/products/product-page-breadcrumbs';
import { toast } from '@/components/ui/toast';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import {
  createProductAddFormSchema,
  PRODUCT_ADD_CATEGORIES,
  PRODUCT_ADD_DISCOUNT_TYPES,
  productAddDefaultValues,
} from '@/lib/products/product-add-schema';
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

function ProductAddPageComponent() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const schema = useMemo(() => createProductAddFormSchema(locale), [locale]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const form = useForm({
    defaultValues: productAddDefaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      toast(t('admin.products.add.submitPreview'), 'success');
      void value;
    },
  });

  const submitWithStatus = useCallback(
    async (nextStatus: 'DRAFT' | 'ACTIVE') => {
      form.setFieldValue('status', nextStatus);
      await form.handleSubmit();
    },
    [form],
  );

  const handleDiscard = useCallback(() => {
    router.push('/products');
  }, [router]);

  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 md:-mt-6">
      <header className="border-b border-border/60 bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-bold tracking-[0.08em] text-[#111827] uppercase">
            {t('admin.products.add.pageTitle')}
          </h1>
          <ProductPageBreadcrumbs currentLabelKey="admin.products.add.breadcrumbCurrent" />
        </div>
      </header>

      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          void submitWithStatus('ACTIVE');
        }}
      >
        <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 md:py-5">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
            <div className={cn(detailCardClass, 'px-4 py-3 md:px-5')}>
              <Link
                href="/products"
                className="text-sm font-medium text-[#2563eb] underline underline-offset-2 transition-colors hover:text-[#1d4ed8]"
              >
                {t('admin.products.detail.backToProducts')}
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <ProductFormSectionCard
                  title={t('admin.products.add.sections.information.title')}
                  description={t('admin.products.add.sections.information.description')}
                >
                  <form.Field name="name">
                    {(field) => (
                      <ProductFormField
                        htmlFor="product-name"
                        label={t('admin.products.add.fields.name')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.nameRequired'),
                        )}
                      >
                        <input
                          id="product-name"
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
                          htmlFor="product-sku"
                          label={t('admin.products.add.fields.sku')}
                          required
                          error={fieldErrorText(
                            field.state.meta.errors,
                            t('admin.products.add.validation.skuRequired'),
                          )}
                        >
                          <input
                            id="product-sku"
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
                          htmlFor="product-stock"
                          label={t('admin.products.add.fields.stock')}
                          required
                          error={fieldErrorText(
                            field.state.meta.errors,
                            t('admin.products.add.validation.stockRequired'),
                          )}
                        >
                          <input
                            id="product-stock"
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
                        htmlFor="product-description"
                        label={t('admin.products.add.fields.description')}
                        optionalLabel={t('admin.products.add.optional')}
                        error={fieldErrorText(field.state.meta.errors, '')}
                      >
                        <ProductDescriptionEditor
                          id="product-description"
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
                  title={t('admin.products.add.sections.image.title')}
                  description={t('admin.products.add.sections.image.description')}
                >
                  <ProductImageUpload files={imageFiles} onChange={setImageFiles} />
                </ProductFormSectionCard>

                <ProductAddFormActions
                  onDiscard={handleDiscard}
                  onSaveDraft={() => void submitWithStatus('DRAFT')}
                />
              </div>

              <div className="flex flex-col gap-4">
                <ProductFormSectionCard
                  title={t('admin.products.add.sections.pricing.title')}
                  description={t('admin.products.add.sections.pricing.description')}
                >
                  <form.Field name="basePrice">
                    {(field) => (
                      <ProductFormField
                        htmlFor="product-base-price"
                        label={t('admin.products.add.fields.basePrice')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.basePriceRequired'),
                        )}
                      >
                        <ProductFormIconInput
                          id="product-base-price"
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
                        htmlFor="product-discount-type"
                        label={t('admin.products.add.fields.discountType')}
                        optionalLabel={t('admin.products.add.optional')}
                      >
                        <ProductFormIconSelect
                          id="product-discount-type"
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
                        htmlFor="product-discount-value"
                        label={t('admin.products.add.fields.discountValue')}
                        optionalLabel={t('admin.products.add.optional')}
                      >
                        <ProductFormIconInput
                          id="product-discount-value"
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
                  title={t('admin.products.add.sections.organize.title')}
                  description={t('admin.products.add.sections.organize.description')}
                >
                  <form.Field name="brand">
                    {(field) => (
                      <ProductFormField
                        htmlFor="product-brand"
                        label={t('admin.products.add.fields.brand')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.brandRequired'),
                        )}
                      >
                        <ProductFormIconInput
                          id="product-brand"
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
                        htmlFor="product-category"
                        label={t('admin.products.add.fields.category')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.categoryRequired'),
                        )}
                      >
                        <ProductFormIconSelect
                          id="product-category"
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
                        htmlFor="product-status"
                        label={t('admin.products.add.fields.status')}
                        required
                        error={fieldErrorText(
                          field.state.meta.errors,
                          t('admin.products.add.validation.statusRequired'),
                        )}
                      >
                        <ProductFormIconSelect
                          id="product-status"
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
                        htmlFor="product-tags"
                        label={t('admin.products.add.fields.tags')}
                      >
                        <ProductFormIconInput
                          id="product-tags"
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
    </div>
  );
}

export const ProductAddPage = memo(ProductAddPageComponent);
