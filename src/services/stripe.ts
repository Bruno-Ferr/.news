import Stripe from 'stripe';
import { version } from '../../package.json';

export const stripe = new Stripe(
    process.env.STRIPE_API_KEY,       //Primeiro parametro precisa ser a chave do stripe e o segundo são algumas infos obrigatórias
    {
        apiVersion: '2020-08-27',
        appInfo: {
            name: 'igbnews',
            version
        },
    } 
)