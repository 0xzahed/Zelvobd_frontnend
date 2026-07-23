import { useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';

export default function CheckoutTab({ register, control }: { register: any, control: any }) {
  const { fields: tableRows, append: addTableRow, remove: removeTableRow } = useFieldArray({ control, name: 'tableSection.tableData' });
  const { fields: faqs, append: addFaq, remove: removeFaq } = useFieldArray({ control, name: 'faqSection.qas' });

  return (
    <div className="space-y-10">

      {/* Specifications Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Specifications Table</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div><Label>Caption</Label><Input {...register('tableSection.caption')} /></div>
          <div><Label>Title</Label><Input {...register('tableSection.title')} /></div>
          <div><Label>Subtitle</Label><Input {...register('tableSection.subtitle')} /></div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Table Rows (Key / Value)</Label>
            <button type="button" onClick={() => addTableRow({ key: '', value: '' })} className="text-sm text-primary flex items-center gap-1 hover:underline">
              <Plus className="h-4 w-4" /> Add Row
            </button>
          </div>
          <div className="space-y-2">
            {tableRows.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input {...register(`tableSection.tableData.${index}.key`)} placeholder="Key (e.g. Brand)" />
                <Input {...register(`tableSection.tableData.${index}.value`)} placeholder="Value (e.g. Kiam)" />
                <button type="button" onClick={() => removeTableRow(index)} className="text-red-500 px-2 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div><Label>Bottom Rows Text</Label><Input {...register('tableSection.bottomRows')} placeholder="e.g. 100% Authentic" /></div>
          <div><Label>Button Text</Label><Input {...register('tableSection.buttonText')} placeholder="Order Now" /></div>
        </div>
      </div>

      {/* Checkout Form Config */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Checkout Form Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Caption</Label><Input {...register('checkoutSection.caption')} /></div>
          <div><Label>Title</Label><Input {...register('checkoutSection.title')} /></div>
          <div><Label>Subtitle</Label><Input {...register('checkoutSection.subtitle')} /></div>
          
          <div><Label>Product Name (shown on form)</Label><Input {...register('checkoutSection.productName')} /></div>
          <div><Label>Product SubName</Label><Input {...register('checkoutSection.subName')} /></div>
          <div><Label>Price (shown on form)</Label><Input {...register('checkoutSection.price')} /></div>
          
          <div className="md:col-span-3">
            <Label>Delivery Options Text (e.g. "Cash on Delivery / Free Delivery")</Label>
            <Input {...register('checkoutSection.deliveryText')} />
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold">FAQs</h3>
          <button type="button" onClick={() => addFaq({ question: '', answer: '' })} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div><Label>Caption</Label><Input {...register('faqSection.caption')} /></div>
          <div><Label>Title</Label><Input {...register('faqSection.title')} /></div>
        </div>
        <div className="space-y-3">
          {faqs.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-md relative flex gap-3">
              <div className="flex-1 space-y-2">
                <Input {...register(`faqSection.qas.${index}.question`)} placeholder="Question" />
                <Textarea {...register(`faqSection.qas.${index}.answer`)} placeholder="Answer" className="h-16" />
              </div>
              <button type="button" onClick={() => removeFaq(index)} className="text-red-500 hover:bg-red-50 px-2 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">WhatsApp Support Widget</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Phone Number</Label><Input {...register('whatsappSection.phoneNumber')} placeholder="e.g. 01700000000" /></div>
          <div><Label>Pre-filled Message</Label><Input {...register('whatsappSection.prefilledMessage')} placeholder="Hi, I want to order..." /></div>
        </div>
      </div>

    </div>
  );
}
