import { Sparkles, Heart, Brain, LucideIcon } from 'lucide-react-native';

export interface Persona {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

export const PERSONAS: Persona[] = [
    {
        id: 'vinr',
        name: 'VinR',
        description: 'Your core AI companion, focused on holistic wellness and emotional support.',
        icon: Sparkles,
        color: '#E6C153', // VinR Gold
    },
    {
        id: 'hope',
        name: 'Hope',
        description: 'An empathetic listener who provides comfort and gentle validation.',
        icon: Heart,
        color: '#FF6B6B',
    },
    {
        id: 'sage',
        name: 'Sage',
        description: 'A calm, analytical voice offering practical wisdom and perspective.',
        icon: Brain,
        color: '#4ECDC4',
    }
];
