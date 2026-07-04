import { emotionalEngine } from './emotional';
import { mythicEngine } from './mythic';
import { symbolicEngine } from './symbolic';

export async function analyzeFragment(fragment) {
    return {
        emotional: await emotionalEngine(fragment.body),
        mythic: await mythicEngine(fragment.body),
        symbolic: await symbolicEngine(fragment.body)
    };
}

