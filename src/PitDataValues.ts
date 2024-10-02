/**
 * This is the data that is stored in the PitDataContext
 * 
 * These are the fields that are filled out by the user.
 *
 * When you change these, remember to change the ProtoBuf file as well! **`/public/protobuf/data_transfer.proto`**
 */
export type PitDataFields = {
    //TODO: Add the fields
}

/**
 * This is the information about each field in the PitDataFields object.
 * 
 * This is used for display purposes, state initialization, and serialization.
 */
export const PitDataFieldInformation: Readonly<PitDataFieldInformationRecord> = {
    // TODO: Add the fields
}


// *** DO NOT EDIT BELOW THIS LINE ***

// This makes sure the PitDataFields and PitDataFieldInformationRecord are in sync
type PitDataFieldInformationRecord = {
    [K in keyof PitDataFields]: {
        /**
         * The name of the field, used for display purposes
         */
        name: string
        /**
         * The default value of the field, used when creating a new Context
         */
        defaultValue: PitDataFields[K]
        /**
         * An optional function to serialize the value to a string, used for display purposes of the value
         * @param value - The value to serialize
         * @returns A nice string representation of the value
         */
        serialize?: (value: PitDataFields[K]) => string
    }
}