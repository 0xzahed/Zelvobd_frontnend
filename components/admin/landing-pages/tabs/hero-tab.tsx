import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
<<<<<<< HEAD
import { Controller, useFieldArray } from 'react-hook-form';
import { ImageUpload } from '../../image-upload';
import { Trash2, Plus } from 'lucide-react';

export default function HeroTab({ register, control }: { register: any, control: any }) {
  const { fields: sliderImages, append: addSliderImage, remove: removeSliderImage } = useFieldArray({ control, name: 'sliderSection.images' as never });
=======
import { Controller } from 'react-hook-form';
import { ImageUpload } from '../../image-upload';

export default function HeroTab({ register, control }: { register: any, control: any }) {
>>>>>>> 7b9029f (feat: implement image upload component and integrate with landing page forms)
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Hero Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Caption (e.g. "Limited Time Offer")</Label>
            <Input {...register('heroSection.caption')} placeholder="Caption" />
          </div>
          <div>
            <Label>Title (e.g. "Kiam Black Diamond 9-Piece")</Label>
            <Input {...register('heroSection.title')} placeholder="Title" />
          </div>
        </div>

        <div>
          <Label>Subtitle (e.g. "Cook without oil, lasts forever.")</Label>
          <Input {...register('heroSection.subtitle')} placeholder="Subtitle" />
        </div>

        <div>
          <Controller
            name="heroSection.image"
            control={control}
            render={({ field }) => (
              <ImageUpload
                label="Hero Image"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Regular Price (e.g. "8500")</Label>
            <Input 
              {...register('heroSection.regularPrice', {
                onChange: (e: any) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }
              })} 
              placeholder="8500" 
              inputMode="numeric"
            />
          </div>
          <div>
            <Label>Offer Price (e.g. "6400")</Label>
            <Input 
              {...register('heroSection.offerPrice', {
                onChange: (e: any) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }
              })} 
              placeholder="6400" 
              inputMode="numeric"
            />
          </div>
        </div>

        <div>
          <Label>Button Text</Label>
          <Input {...register('heroSection.buttonText')} placeholder="Order Now" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Countdown Timer</h3>
        <div>
          <Label>Target Date & Time (Leave blank to hide timer)</Label>
          <Input type="datetime-local" {...register('timerSection.targetDateTime')} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold">Banner Slider Images</h3>
          <button type="button" onClick={() => addSliderImage({ url: '' })} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <Plus className="h-4 w-4" /> Add Image
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sliderImages.map((field, index) => (
            <div key={field.id} className="relative p-2 border rounded-md">
              <Controller
                name={`sliderSection.images.${index}.url`}
                control={control}
                render={({ field: f }) => (
                  <ImageUpload label={`Image ${index + 1}`} value={f.value} onChange={f.onChange} />
                )}
              />
              <button type="button" onClick={() => removeSliderImage(index)} className="absolute top-2 right-2 text-red-500 bg-white/80 rounded hover:bg-red-50 p-1 shadow-sm">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {sliderImages.length === 0 && (
             <div className="col-span-full text-sm text-gray-500 py-4 text-center border-2 border-dashed rounded-md">
               No slider images added. Click "Add Image" to include a banner slider.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
