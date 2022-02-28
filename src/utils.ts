import { coinConvert } from '@stakeordie/griptape.js'
import tokens from '@/data/tokens.json'

export function formatAmountforToken(address: string, amount: string): string {
    const token = tokens.find(it => it.address === address);
    if (!token) throw new Error('No token found for address ' + address);
    return coinConvert(amount, token.decimals, 'machine');
}

export function getCodeHash(address: string){
    const token = tokens.find(it => it.address === address);
    if (!token) throw new Error('No token found for address ' + address);
    return token.codeHash;
}

export function fromLiteraltoEpoch(value: string){
    return Date.parse(value) / 1000;
}