export interface User {
    _id?: string;
    email: string;
    password: string;
    createdAt?: Date;
}

export interface LCARecord {
    CASE_NUMBER: string;
    CASE_STATUS: string;
    EMPLOYER_NAME: string;
    JOB_TITLE: string;
    SOC_TITLE: string;
    EMPLOYER_CITY: string;
    EMPLOYER_STATE: string;
    WAGE_RATE_OF_PAY_FROM: string;
    WAGE_RATE_OF_PAY_TO?: string;
    EMPLOYER_POC_EMAIL?: string;
    EMPLOYER_ADDRESS1?: string;
    EMPLOYER_POSTAL_CODE?: string;
    BEGIN_DATE?: string;
    END_DATE?: string;
    FULL_TIME_POSITION?: string;
    [key: string]: any;
}

export interface FilterOption {
    id: string;
    type: 'state' | 'wage' | 'position' | 'status';
    value: string;
    operator?: 'equals' | 'contains' | 'greater' | 'less';
}