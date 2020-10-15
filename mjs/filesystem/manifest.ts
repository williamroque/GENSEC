export interface Extension {
    name: string,
    extensions: string[]
}

export interface SettingsSchema {
    [propName: string]: {
        title: string,
        entries: {
            [propName: string]: {
                title: string,
                setting: any,
                type: string,
                [propName: string]: string
            }
        }
    }
}

interface FormRow {
    type: string,
    [propName: string]: any
}

export default interface Manifest {
    title: string,
    programName: string,
    packageName: string,
    requirements: string[],
    allowedOutputExtensions: Extension[],
    form: FormRow[],
    isDefault?: boolean,
    requiresDatabaseAccess?: boolean,
    dataHeaders?: string[],
    defaultSettings?: SettingsSchema
}