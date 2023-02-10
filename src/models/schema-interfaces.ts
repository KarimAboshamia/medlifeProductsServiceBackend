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

// -------------------------------------------------------------
export interface IPharmacyReviewSchema {
    rate: number;
    description: string;
    //! this ID refers to a pharmacy (IPharmacySchema)
    pharmacy: Schema.Types.ObjectId;
    //! this ID refers to a patient (IPatientSchema)
    reviewer: Schema.Types.ObjectId;
}

export interface IPharmacyProductSchema {
    //! this ID refers to a product (IProductSchema)
    product: Schema.Types.ObjectId;
    //! this ID refers to a pharmacy (IPharmacySchema)
    pharmacy: Schema.Types.ObjectId;
    amount: number;
    price: number;
    //? ex: 30% | 10 (10 pounds)
    offer: string;
}
