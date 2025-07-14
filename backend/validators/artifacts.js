import { body, param, query } from 'express-validator';

const artifactValidator = [
  body('fileType')
    .exists({ checkFalsy: true }).withMessage("fileType is required.")
    .isIn(["TEXT", "FILE"]).withMessage("fileType must be 'TEXT' or 'FILE'."),

  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage("Title must be at most 255 characters."),

  body('textContent')
    .if(body('fileType').equals("TEXT"))
    .exists({ checkFalsy: true }).withMessage("Missing text content for TEXT artifact.")
    .isString().withMessage("Text content must be a string."),

  body('fileUrl')
    .if(body('fileType').equals("FILE"))
    .exists({ checkFalsy: true }).withMessage("Missing file URL for FILE artifact.")
    .isURL().withMessage("fileUrl must be a valid URL."),

  body('fileName')
    .if(body('fileType').equals("FILE"))
    .exists({ checkFalsy: true }).withMessage("Missing file name for FILE artifact.")
    .isLength({ min: 1 }).withMessage("fileName must be a non-empty string."),

  body('fileSize')
    .if(body('fileType').equals("FILE"))
    .exists({ checkFalsy: true }).withMessage("Missing file size for FILE artifact.")
    .isNumeric().withMessage("fileSize must be a number."),
];

const getArtifactsValidator = [
  param('userId')
    .trim()
    .notEmpty().withMessage('userId is required')
    .isString().withMessage('userId must be a string'),
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


export { artifactValidator, getArtifactsValidator }
