/**
 * Dize olarak FORM Kimliği Oluşturma
 */
module.exports = function renderFormId(formId) {
    var hexId = (formId | 0).toString(16).toUpperCase();
    return '[' + '00000000'.substring(0, 8 - hexId.length) + hexId + ']';
};
