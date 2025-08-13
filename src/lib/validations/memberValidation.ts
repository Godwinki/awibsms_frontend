// Tanzania-specific validation utilities for member registration

// Regex patterns
const TZ_PHONE_REGEX = /^(?:\+?255|0)[67]\d{8}$/;
const TZ_NIN_REGEX = /^(19|20)\d{11}$/; // YYYYNNNNNNNNNN format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Field validations
export const validateNIN = (nin: string): { valid: boolean; message?: string } => {
  if (!nin) return { valid: false, message: "NIN is required" };
  if (!TZ_NIN_REGEX.test(nin)) {
    return { valid: false, message: "Invalid NIN format. Should be 13 digits starting with 19 or 20" };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  if (!phone) return { valid: false, message: "Phone number is required" };
  if (!TZ_PHONE_REGEX.test(phone)) {
    return { 
      valid: false, 
      message: "Invalid Tanzania phone number. Use format: +255XXXXXXXXX or 0XXXXXXXXX (starting with 6 or 7)" 
    };
  }
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) return { valid: true }; // Email can be optional
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: "Invalid email format" };
  }
  return { valid: true };
};

export const validateDateOfBirth = (dob: string): { valid: boolean; message?: string } => {
  if (!dob) return { valid: false, message: "Date of birth is required" };
  
  const dobDate = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - dobDate.getFullYear();
  
  if (isNaN(dobDate.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }
  
  if (age < 18) {
    return { valid: false, message: "Member must be at least 18 years old" };
  }
  
  if (age > 100) {
    return { valid: false, message: "Please verify the date of birth" };
  }
  
  return { valid: true };
};

export const validateRequiredField = (
  value: string, 
  fieldName: string
): { valid: boolean; message?: string } => {
  if (!value || value.trim() === "") {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validatePercentages = (beneficiaries: any[]): { valid: boolean; message?: string } => {
  if (!beneficiaries || beneficiaries.length === 0) return { valid: true };
  
  let total = 0;
  for (const beneficiary of beneficiaries) {
    const percent = parseFloat(beneficiary.percentage || "0");
    if (isNaN(percent)) {
      return { valid: false, message: "All percentages must be valid numbers" };
    }
    total += percent;
  }
  
  if (total !== 100 && beneficiaries.length > 0) {
    return { valid: false, message: `Total percentage should be 100%, current total is ${total}%` };
  }
  
  return { valid: true };
};

// Step validation functions
export const validatePersonalInfoStep = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate NIN if ID type is NIN
  if (formData.idType === 'nin' || !formData.idType) {
    const ninValidation = validateNIN(formData.nin);
    if (!ninValidation.valid) errors.idNo = ninValidation.message!;
  }
  
  // Validate Full Name
  const nameValidation = validateRequiredField(formData.fullName, "Full Name");
  if (!nameValidation.valid) errors.fullName = nameValidation.message!;
  
  // Validate ID Number
  const idValidation = validateRequiredField(formData.idNo, "ID Number");
  if (!idValidation.valid) errors.idNo = idValidation.message!;
  
  // Validate Date of Birth
  const dobValidation = validateDateOfBirth(formData.dateOfBirth);
  if (!dobValidation.valid) errors.dateOfBirth = dobValidation.message!;
  
  // Validate Gender
  if (!formData.gender) {
    errors.gender = "Gender is required";
  }
  
  // Validate Mobile Number
  const mobileValidation = validatePhone(formData.mobile);
  if (!mobileValidation.valid) errors.mobile = mobileValidation.message!;
  
  // Validate Email if provided
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) errors.email = emailValidation.message!;
  
  // Validate Residence
  const residenceValidation = validateRequiredField(formData.residence, "Residence");
  if (!residenceValidation.valid) errors.residence = residenceValidation.message!;
  
  // Place of Birth is optional
  // No validation required
  
  // Validate Marital Status
  if (!formData.maritalStatus) {
    errors.maritalStatus = "Marital Status is required";
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateIncomeStep = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate Income Source
  const incomeSourceValidation = validateRequiredField(formData.incomeSource, "Source of Income");
  if (!incomeSourceValidation.valid) errors.incomeSource = incomeSourceValidation.message!;
  
  // Validate Business Type if provided
  if (formData.businessType) {
    // If business type is partnership, validate partners field
    if (formData.businessType === 'partnership' && !formData.partners) {
      errors.partners = "Number of partners is required";
    }
    
    // If business type is company, validate owners field
    if (formData.businessType === 'company' && !formData.owners) {
      errors.owners = "Number of owners is required";
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateBeneficiariesStep = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate total percentages
  const percentValidation = validatePercentages(formData.beneficiaries);
  if (!percentValidation.valid) errors.beneficiaries = percentValidation.message!;
  
  // Validate individual beneficiaries
  formData.beneficiaries.forEach((beneficiary: any, index: number) => {
    if (!beneficiary.name) {
      errors[`beneficiary_${index}_name`] = "Beneficiary name is required";
    }
    
    if (!beneficiary.relationship) {
      errors[`beneficiary_${index}_relationship`] = "Relationship is required";
    }
    
    if (!beneficiary.percentage) {
      errors[`beneficiaries_${index}_percentage`] = "Percentage is required";
    } else {
      const percent = parseFloat(beneficiary.percentage);
      if (isNaN(percent) || percent <= 0 || percent > 100) {
        errors[`beneficiaries_${index}_percentage`] = "Percentage must be between 0 and 100";
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmergencyContactsStep = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Check if at least one emergency contact is provided
  if (!formData.emergencyContacts || formData.emergencyContacts.length === 0) {
    errors.emergencyContacts = "At least one emergency contact is required";
    return { valid: false, errors };
  }
  
  // Validate each emergency contact
  formData.emergencyContacts.forEach((contact: any, index: number) => {
    // Validate name
    if (!contact.name) {
      errors[`emergencyContacts_${index}_name`] = "Contact name is required";
    } else if (contact.name === formData.fullName) {
      errors[`emergencyContacts_${index}_name`] = "Emergency contact cannot have the same name as the member";
    }
    
    // Validate relationship
    if (!contact.relationship) {
      errors[`emergencyContacts_${index}_relationship`] = "Relationship is required";
    }
    
    // Validate phone
    if (!contact.phone) {
      errors[`emergencyContacts_${index}_phone`] = "Phone number is required";
    } else {
      // Check phone format
      const phoneValidation = validatePhone(contact.phone);
      if (!phoneValidation.valid) {
        errors[`emergencyContacts_${index}_phone`] = phoneValidation.message!;
      }
      
      // Check if phone is same as member's
      if (contact.phone === formData.mobile) {
        errors[`emergencyContacts_${index}_phone`] = "Emergency contact cannot have the same phone number as the member";
      }
    }
    
    // Validate address
    if (!contact.address) {
      errors[`emergencyContacts_${index}_address`] = "Address is required";
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAdditionalInfoStep = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate Know-How selection
  if (!formData.knowHow) {
    errors.knowHow = "Please select how you learned about the SACCO";
  }
  
  // If knowHow requires detail, validate it
  if ((formData.knowHow === 'member' || 
       formData.knowHow === 'advert' || 
       formData.knowHow === 'other') && 
      !formData.knowHowDetail) {
    errors.knowHowDetail = "Please provide additional details";
  }
  
  // Validate Other SACCOs selection
  if (!formData.otherSaccos) {
    errors.otherSaccos = "Please indicate if you participate in other SACCOs";
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFinalSubmission = (formData: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Declaration must be checked
  if (!formData.declaration) {
    errors.declaration = "You must agree to the declaration to proceed";
  }
  
  // Combine all previous validation steps
  const personalInfoValidation = validatePersonalInfoStep(formData);
  const incomeValidation = validateIncomeStep(formData);
  const beneficiariesValidation = validateBeneficiariesStep(formData);
  const emergencyContactsValidation = validateEmergencyContactsStep(formData);
  const additionalInfoValidation = validateAdditionalInfoStep(formData);
  
  // Merge all errors
  return {
    valid: personalInfoValidation.valid && 
           incomeValidation.valid && 
           beneficiariesValidation.valid && 
           emergencyContactsValidation.valid && 
           additionalInfoValidation.valid && 
           !errors.declaration,
    errors: {
      ...personalInfoValidation.errors,
      ...incomeValidation.errors,
      ...beneficiariesValidation.errors,
      ...emergencyContactsValidation.errors,
      ...additionalInfoValidation.errors,
      ...errors
    }
  };
};
