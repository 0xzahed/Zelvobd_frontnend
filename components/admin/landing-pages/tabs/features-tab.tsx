import { useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { ImageUpload } from '../../image-upload';
import { LucideIconPickerModal } from '../../lucide-icon-picker';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

export default function FeaturesTab({ register, control }: { register: any, control: any }) {
  const { fields: featureCards, append: addCard, remove: removeCard } = useFieldArray({ control, name: 'featureCards' });
  const { fields: videoCards, append: addVideoCard, remove: removeVideoCard } = useFieldArray({ control, name: 'videoSection.cards' });
  const { fields: points, append: addPoint, remove: removePoint } = useFieldArray({ control, name: 'bulletPointsSection.points' });

  const [iconPickerOpenFor, setIconPickerOpenFor] = useState<{ name: string, onChange: (val: string) => void } | null>(null);

  return (
    <div className="space-y-10">
      
      {/* 4 Feature Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold">Mini Feature Cards (e.g. Free Delivery, 7 Days Return)</h3>
          <button type="button" onClick={() => addCard({ icon: 'check', title: '' })} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <Plus className="h-4 w-4" /> Add Card
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureCards.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md relative group">
              <button type="button" onClick={() => removeCard(index)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Icon Name</Label>
                  <Controller
                    name={`featureCards.${index}.icon`}
                    control={control}
                    render={({ field }) => {
                      const IconC = (LucideIcons as any)[field.value];
                      return (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setIconPickerOpenFor({ name: field.name, onChange: field.onChange })}
                            className="p-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-10 min-h-10"
                          >
                            {IconC ? <IconC className="w-5 h-5" /> : <div className="text-xs">Pick</div>}
                          </button>
                          <Input {...field} placeholder="e.g. ShieldCheck" className="flex-1" />
                        </div>
                      )
                    }}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input {...register(`featureCards.${index}.title`)} placeholder="Title" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Video & Why It's Best Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Caption</Label><Input {...register('videoSection.caption')} placeholder="Caption" /></div>
          <div><Label>Youtube Video Link</Label><Input {...register('videoSection.videoLink')} placeholder="https://youtube.com/..." /></div>
          <div>
            <Controller
              name="videoSection.customThumbnail"
              control={control}
              render={({ field }) => (
                <ImageUpload label="Custom Thumbnail" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Video Features Cards</Label>
            <button type="button" onClick={() => addVideoCard({ icon: '', title: '', subtitle: '' })} className="text-sm text-primary flex items-center gap-1 hover:underline">
              <Plus className="h-4 w-4" /> Add Card
            </button>
          </div>
          <div className="space-y-3">
            {videoCards.map((field, index) => (
              <div key={field.id} className="p-3 border rounded-md flex gap-3 items-center">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Controller
                    name={`videoSection.cards.${index}.icon`}
                    control={control}
                    render={({ field }) => {
                      const IconC = (LucideIcons as any)[field.value];
                      return (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIconPickerOpenFor({ name: field.name, onChange: field.onChange })}
                            className="p-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-10 min-h-10"
                            title="Pick Icon"
                          >
                            {IconC ? <IconC className="w-5 h-5" /> : <div className="text-xs">Pick</div>}
                          </button>
                          <Input {...field} placeholder="Icon name" className="flex-1" />
                        </div>
                      )
                    }}
                  />
                  <Input {...register(`videoSection.cards.${index}.title`)} placeholder="Title" />
                  <Input {...register(`videoSection.cards.${index}.subtitle`)} placeholder="Subtitle" />
                </div>
                <button type="button" onClick={() => removeVideoCard(index)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bullet Points */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold">Bullet Points Section</h3>
          <button type="button" onClick={() => addPoint({ value: '' })} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <Plus className="h-4 w-4" /> Add Point
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div><Label>Caption</Label><Input {...register('bulletPointsSection.caption')} /></div>
            <div><Label>Title</Label><Input {...register('bulletPointsSection.title')} /></div>
            <div><Label>Subtitle</Label><Input {...register('bulletPointsSection.subtitle')} /></div>
          </div>
          <div>
            <Controller
              name="bulletPointsSection.image"
              control={control}
              render={({ field }) => (
                <ImageUpload label="Main Image" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
        <div className="space-y-2 mt-2">
          {points.map((field: any, index) => (
            <div key={field.id} className="flex gap-2">
              <Input {...register(`bulletPointsSection.points.${index}.value`)} placeholder={`Point ${index + 1}`} />
              <button type="button" onClick={() => removePoint(index)} className="text-red-500 px-2 hover:bg-red-50 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Secret Care Tip Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">Secret Care Tip (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <Label>Icon</Label>
            <Controller
              name="tipsSection.icon"
              control={control}
              render={({ field }) => {
                const IconC = field.value ? (LucideIcons as any)[field.value] : null;
                return (
                  <div className="flex items-center mt-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setIconPickerOpenFor({ name: field.name, onChange: field.onChange })}
                      className="p-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-10 min-h-10"
                    >
                      {IconC ? <IconC className="w-5 h-5" /> : <div className="text-xs">Pick</div>}
                    </button>
                    <Input {...field} className="hidden" />
                  </div>
                )
              }}
            />
          </div>
          <div className="md:col-span-5">
            <Label>Title</Label>
            <Input {...register('tipsSection.title')} placeholder="e.g. দীর্ঘদিন ভালো রাখার ১টি গোপন টিপস!" className="mt-1" />
          </div>
          <div className="md:col-span-5">
            <Label>Description</Label>
            <Input {...register('tipsSection.subtitle')} placeholder="Description..." className="mt-1" />
          </div>
        </div>
      </div>

      {iconPickerOpenFor && (
        <LucideIconPickerModal
          isOpen={true}
          onClose={() => setIconPickerOpenFor(null)}
          onSelectIcon={(iconName) => {
            iconPickerOpenFor.onChange(iconName);
            setIconPickerOpenFor(null);
          }}
        />
      )}
    </div>
  );
}
