// types/index.ts - UPDATED
export interface User {
    _id?: string;
    email: string;
    password: string;
    createdAt?: Date;
}

export interface LCARecord {
    CASE_NUMBER: string;
    CASE_STATUS: string;
    RECEIVED_DATE?: string;
    DECISION_DATE?: string;
    VISA_CLASS?: string;
    EMPLOYER_NAME: string;
    JOB_TITLE: string;
    JOB_DOMAIN?: string;
    SOC_CODE?: string;
    SOC_TITLE: string;
    EMPLOYER_CITY: string;
    EMPLOYER_STATE: string;
    EMPLOYER_POSTAL_CODE?: string;
    WAGE_RATE_OF_PAY_FROM: string;
    WAGE_RATE_OF_PAY_TO?: string;
    WAGE_UNIT_OF_PAY?: string;
    PREVAILING_WAGE?: string;
    PW_UNIT_OF_PAY?: string;
    PW_WAGE_LEVEL?: string;
    FULL_TIME_POSITION?: string;
    BEGIN_DATE?: string;
    END_DATE?: string;
    NAICS_CODE?: string;
    H_1B_DEPENDENT?: string;
    WILLFUL_VIOLATOR?: string;
    TOTAL_WORKER_POSITIONS?: string;
    NEW_EMPLOYMENT?: string;
    CONTINUED_EMPLOYMENT?: string;
    CHANGE_PREVIOUS_EMPLOYMENT?: string;
    EMPLOYER_POC_EMAIL?: string;
    EMPLOYER_ADDRESS1?: string;
    EMPLOYER_PHONE?: string;
    WORKSITE_CITY?: string;
    WORKSITE_STATE?: string;
    WORKSITE_POSTAL_CODE?: string;
    [key: string]: any;
}

export interface FilterOption {
    column: string;
    values: string[];
}

export interface ApplicationTracking {
    _id?: string;
    userId: string;
    userEmail: string;
    companyName: string;
    jobTitle: string;
    employerDomain: string;
    recipientEmail: string;
    caseNumber?: string;
    emailSubject: string;
    emailBody: string;
    status: 'sent' | 'failed';
    sentAt: Date;
    lcaData?: Partial<LCARecord>;
}