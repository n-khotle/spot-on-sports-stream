import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface GameFormData {
  title: string;
  description: string;
  status: string;
  featured: boolean;
}

interface GameFormFieldsProps {
  formData: GameFormData;
  onFieldChange: (field: keyof GameFormData, value: string | boolean) => void;
  disabled?: boolean;
}

const GameFormFields = ({ formData, onFieldChange, disabled }: GameFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          placeholder="Game title"
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Game description"
          rows={3}
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onFieldChange('status', value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => onFieldChange('featured', checked)}
          disabled={disabled}
        />
        <Label htmlFor="featured">Featured Game</Label>
      </div>
    </>
  );
};

export default GameFormFields;