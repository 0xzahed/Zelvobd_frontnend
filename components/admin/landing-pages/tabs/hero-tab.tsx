import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';
import { ImageUpload } from '../../image-upload';

export default function HeroTab({ register, control }: { register: any, control: any }) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Hero Section</h3>
        
        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Regular Price (e.g. "8500")</Label>
            <Input {...register('heroSection.regularPrice')} placeholder="8500" />
          </div>
          <div>
            <Label>Offer Price (e.g. "6400")</Label>
            <Input {...register('heroSection.offerPrice')} placeholder="6400" />
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
    </div>
  );
}
