import { userRequest } from '@/lib/RequestMethods'

/**
 * Downloads the bulk CSV template for guard uploads
 */
export const downloadBulkCSVTemplate = () => {
    const templateUrl = 'https://drive.google.com/uc?export=download&id=1ol2Jg2fgfk03I6zWGEnm7JhdAokAk6cS';
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'bulk_guards_upload.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Handles file selection for bulk upload
 * @param {Event} e - File input change event
 * @param {Function} setGuardBulkUploadFile - State setter for the selected file
 */
export const handleFileBulkUpload = (e, setGuardBulkUploadFile) => {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            throw new Error('Please select a valid Excel or CSV file');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size should be less than 10MB');
        }

        setGuardBulkUploadFile(file);
    }
};

/**
 * Handles the submission of bulk guard upload
 * @param {File} guardBulkUploadFile - The selected file for upload
 * @param {Function} setGuardBulkUploadFile - State setter to clear the file after upload
 * @param {string} officeId - The office ID for the upload (optional)
 * @returns {Promise} - API response
 */
export const handleSubmitBulkUpload = async (guardBulkUploadFile, setGuardBulkUploadFile, officeId = null) => {
    if (!guardBulkUploadFile) {
        throw new Error('Please select a file');
    }

    const formData = new FormData();
    formData.append('file', guardBulkUploadFile);

    if (officeId) {
        formData.append('officeId', officeId);
    }

    try {
        const response = await userRequest.post('/file/upload/guards', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("bulk upload response", response);

        // Clear the file after successful upload
        setGuardBulkUploadFile(null);

        return response;
    } catch (error) {
        // Re-throw the error to be handled by the component
        throw error;
    }
};

/**
 * Validates the bulk upload file before submission
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid boolean and error message
 */
export const validateBulkUploadFile = (file) => {
    if (!file) {
        return { isValid: false, error: 'Please select a file' };
    }

    // Check file type
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        return { isValid: false, error: 'Please select a valid Excel or CSV file' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { isValid: false, error: 'File size should be less than 10MB' };
    }

    return { isValid: true, error: null };
};

