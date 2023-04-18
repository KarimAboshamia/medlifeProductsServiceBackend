import { Schema } from 'mongoose';

// todo
export enum EProductCategory {
    CONTROLLED,
    GSL,
    PRESCRIPTION,
    DRUG,
}

// todo
export enum EProductType {
    LIQUID,
    TABLET,
    SUBLINGUAL_TABLET,
    CAPSULE,
    INJECTION,
    TOPICAL_MEDICINE,
    SUPPOSITORY,
    DROP,
    INHALER,
    PATCH,
}

export interface IProductSchema {
    name: string;
    barcode: string;
    type: string;
    categories: string[];
    images: string[];
    description: string[];
    indication?: string[];
    sideEffects?: string[];
    dosage?: string[];
    overdoseEffects?: string[];
    precautions?: string[];
    interactions?: string[];
    storage?: string[];
}

export interface ICategorySchema {
    name: string;
}

// -------------------------------------------------------------
export interface IPharmacyReviewSchema {
    rate: number;
    description: string;
    pharmacy: string;
    reviewer: string;
}

export interface IPharmacyProductSchema {
    //! IProductSchema object not id
    product: IProductSchema;
    pharmacy: string;
    amount: number;
    price: number;
    //? ex: 30% | 10 (10 pounds)
    offer: string;
}

// -------------------------------------------------------------

export interface INotifyWhenAvailableRequestSchema {
    productId: Schema.Types.ObjectId;
    pharmacyId: string | null;
    patientId: string;
}
