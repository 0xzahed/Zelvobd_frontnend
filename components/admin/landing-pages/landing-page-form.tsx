'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { AdminPrimaryButton } from '@/components/admin/admin-ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/src/hooks/api/useProducts';
import HeroTab from './tabs/hero-tab';
import FeaturesTab from './tabs/features-tab';
import CheckoutTab from './tabs/checkout-tab';

const COLOR_PALETTES = [
  { id: 'blue', name: 'Blue (Default)', color: '#3b82f6' },
  { id: 'green', name: 'Green (Fresh)', color: '#22c55e' },
  { id: 'red', name: 'Red (Urgent)', color: '#ef4444' },
  { id: 'purple', name: 'Purple (Premium)', color: '#a855f7' },
  { id: 'orange', name: 'Orange (Warm)', color: '#f97316' },
];

export default function LandingPageForm({ initialData, onSubmit, isSubmitting }: { initialData?: any, onSubmit: (data: any) => void, isSubmitting?: boolean }) {
  const router = useRouter();
  const { data: productsResult } = useProducts(1, 100);
  const products = productsResult?.data || [];

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      slug: '',
      colorPalette: 'blue',
      productId: '',
      heroSection: { caption: '', title: '', subtitle: '', image: '', regularPrice: '', offerPrice: '', buttonText: 'Order Now' },
      tableSection: { caption: '', title: '', subtitle: '', tableData: [{ key: '', value: '' }], bottomRows: '', buttonText: 'Order Now' },
      featureCards: [{ icon: 'truck', title: 'Free Delivery' }],
      timerSection: { targetDateTime: '' },
      videoSection: { caption: '', videoLink: '', customThumbnail: '', playButtonImage: '', cards: [{ icon: 'check', title: '', subtitle: '', image: '' }] },
      bulletPointsSection: { caption: '', title: '', subtitle: '', points: [''] },
      tipsSection: { title: '', subtitle: '' },
      checkoutSection: { caption: '', title: '', subtitle: '', productName: '', subName: '', price: '', deliveryText: 'Cash on Delivery' },
      faqSection: { caption: '', title: '', qas: [{ question: '', answer: '' }] },
      whatsappSection: { phoneNumber: '', prefilledMessage: '' }
    }
  });

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase().trim()
      .replace(/[\s\W-]+/g, '-') // replace spaces and non-word chars with -
      .replace(/^-+|-+$/g, ''); // remove leading/trailing -
  };

  const handleSlugGen = (e: any) => {
    setValue('slug', generateSlug(e.target.value));
  };

  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'hero', label: 'Hero' },
    { id: 'features', label: 'Features & Video' },
    { id: 'checkout', label: 'Checkout & Info' },
  ];

  const renderGeneral = () => (
    <div className="space-y-4">
      <div>
        <Label>Slug (URL) <span className="text-red-500">*</span></Label>
        <Input {...register('slug', { required: true })} placeholder="e.g. kiam-black-diamond" onChange={handleSlugGen} />
        {errors.slug && <span className="text-xs text-red-500">Slug is required</span>}
        <p className="text-xs text-muted-foreground mt-1">Leave empty to type your own, or type normally to auto-format.</p>
      </div>

      <div>
        <Label>Link to Product (Optional)</Label>
        <Controller
          name="productId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product to link orders to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Product (Custom)</SelectItem>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground mt-1">If selected, landing page orders will be linked to this inventory item.</p>
      </div>

      <div>
        <Label>Color Palette</Label>
        <div className="flex gap-4 mt-2">
          {COLOR_PALETTES.map(palette => (
            <label key={palette.id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" {...register('colorPalette')} value={palette.id} className="accent-primary" />
              <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: palette.color }}></div>
              <span className="text-sm font-medium capitalize">{palette.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex border-b border-border mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
        {activeTab === 'general' && renderGeneral()}
        {activeTab === 'hero' && <HeroTab register={register} />}
        {activeTab === 'features' && <FeaturesTab register={register} control={control} />}
        {activeTab === 'checkout' && <CheckoutTab register={register} control={control} />}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
          Cancel
        </button>
        <AdminPrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Landing Page'}
        </AdminPrimaryButton>
      </div>
    </form>
  );
}
