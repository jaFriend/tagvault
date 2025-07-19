import { body, param, query } from 'express-validator';
const baseArtifactValidator = [
  body('fileType')
    .exists({ checkFalsy: true }).withMessage("fileType is required.")
    .isIn(["TEXT", "FILE"]).withMessage("fileType must be 'TEXT' or 'FILE'."),

  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage("Title must be at most 255 characters."),
];
const validateTextArtifact = [
  body('textContent')
    .exists({ checkFalsy: true }).withMessage("Missing text content for TEXT artifact.")
    .isString().withMessage("Text content must be a string."),
];

const validateFileArtifact = [
  body('fileUrl')
    .custom(value => {
      // Allow null, undefined, empty string, or valid URL
      if (value === null || value === undefined || value === '') {
        return true;
      }
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage('fileUrl must be a valid URL if provided.'),
  body('filename')
    .exists({ checkFalsy: true }).withMessage("Missing file name for FILE artifact.")
    .isLength({ min: 1 }).withMessage("fileName must be a non-empty string."),
  body('fileSize')
    .exists({ checkFalsy: true }).withMessage("Missing file size for FILE artifact.")
    .isNumeric().withMessage("fileSize must be a number."),
];

const conditionalValidator = async (req, res, next) => {
  const type = req.body.fileType;

  if (type === 'TEXT') {
    await Promise.all(validateTextArtifact.map(validation => validation.run(req)));
  } else if (type === 'FILE') {
    await Promise.all(validateFileArtifact.map(validation => validation.run(req)));
  }

  next();
};

const getArtifactsValidator = [
  query('searchValue')
    .default('')
    .isString().withMessage('searchValue must be a string'),
  query('tags')
    .customSanitizer(v => (v === '' ? [] : v))
    .custom(v => {
      if (Array.isArray(v)) {
        if (v.some(t => typeof t !== 'string'))
          throw new Error('each tag must be a string');
        return true;
      }
      throw new Error(
        'tags must be an empty string ("") or an array of strings'
      );
    }),
  query('limit')
    .exists().withMessage("Limit is Required")
    .isInt({ min: 1 }).withMessage("Limit must be a number.")
    .toInt(),
  query('cursor')
    .optional()
    .isString().withMessage("Cursor needs to be in string")
];


export { baseArtifactValidator, conditionalValidator, getArtifactsValidator }
