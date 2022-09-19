const fontkit = require('@pdf-lib/fontkit');
const { PDFDocument, rgb } = require('pdf-lib');
const fetch = require("node-fetch")

const PdfService = () => {
    const pdfTemplatesBaseUrl = 'https://res.cloudinary.com/everyday-speech/image/upload/v1662498207/worksheet_assets/pdf_templates';
    const pdfFontBaseUrl = 'https://res.cloudinary.com/everyday-speech/raw/upload/v1662508982/worksheet_assets/fonts';

    const templateURL = {
        flashcard: {
            first: `${pdfTemplatesBaseUrl}/flashcard_base_first.pdf`,
            others: `${pdfTemplatesBaseUrl}/flashcard_base_others.pdf`,
        },
        diceRoller: {
            first: `${pdfTemplatesBaseUrl}/diceroller_base_first`,
        },
    };

    const colors = {
        body: rgb(0.17, 0.17, 0.17),
        title: rgb(0.01, 0.3, 0.39),
        blue: rgb(0.93, 0.97, 0.98),
    };

    const margin = 35;
    const pageSize = {
        width: 612,
        height: 792,
    };

    const fontURL = {
        quicksand: {
            bold: `${pdfFontBaseUrl}/Quicksand-Bold.ttf`,
            medium: `${pdfFontBaseUrl}/Quicksand-Medium.ttf`,
            regular: `${pdfFontBaseUrl}/Quicksand-Regular.ttf`,
            light: `${pdfFontBaseUrl}/Quicksand-Light.ttf`,
        },
    };

    let fonts;

    const loadPdf = async(url, pdfDoc) => {
        existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

        const srcDoc = await PDFDocument.load(existingPdfBytes);

        const [pdfPage] = await pdfDoc.copyPages(srcDoc, [0]);

        return pdfPage;
    };

    const loadFont = async(url, pdfDoc) => {
        const fontBytes = await fetch(url).then((res) => res.arrayBuffer());

        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontBytes);

        return customFont;
    };

    const getFontStyles = () => {
        const fontStyle = {
            header: {
                size: 18,
                font: fonts.quicksand.bold,
                color: colors.title,
            },
            regular: {
                size: 12,
                lineHeight: 14,
                font: fonts.quicksand.regular,
                color: colors.body,
            },
            bold: {
                size: 12,
                lineHeight: 14,
                font: fonts.quicksand.bold,
                color: colors.body,
            },
            title: {
                size: 11,
                lineHeight: 14,
                font: fonts.quicksand.bold,
                color: colors.title,
            },
            footer: {
                size: 11,
                lineHeight: 14,
                font: fonts.quicksand.light,
                color: colors.body,
            },
        };
        return fontStyle;
    };

    const getComponents = () => {
        const fontStyle = getFontStyles();

        const header = {
            title: {
                x: margin,
                y: pageSize.height - 70,
                ...fontStyle.header,
            },
            page: {
                x: pageSize.width - 76,
                y: pageSize.height - 44,
                ...fontStyle.footer,
                font: fonts.quicksand.medium,
            },
        };

        const description = {
            x: 117,
            y: pageSize.height - 175,
            maxWidth: pageSize.width - 117 - margin,
            ...fontStyle.regular,
        };

        const footer = {
            title: {
                x: 230,
                y: 30,
                ...fontStyle.footer,
            },
            page: {
                x: pageSize.width - 25,
                y: 30,
                ...fontStyle.footer,
                font: fonts.quicksand.bold,
            },
        };

        return {
            header,
            description,
            footer,
        };
    };

    const isJPG = (url) => /\.(jpg)$/.test(url);

    const isPNG = (url) => /\.(png)$/.test(url);

    const calculateImageSize = (image, space) => {
        const size = {
            width: image.width,
            height: image.height,
        };

        if (space.width > space.height) {
            size.height = space.height;
            size.width = (image.width * size.height) / image.height;
        } else {
            size.width = space.width;
            size.height = (image.height * size.width) / image.width;
        }

        return size;
    };

    const initState = async() => {
        const pdfDoc = await PDFDocument.create();

        fonts = {
            quicksand: {
                bold: await loadFont(fontURL.quicksand.bold, pdfDoc),
                medium: await loadFont(fontURL.quicksand.medium, pdfDoc),
                regular: await loadFont(fontURL.quicksand.regular, pdfDoc),
                light: await loadFont(fontURL.quicksand.light, pdfDoc),
            },
        };

        const fontStyle = getFontStyles();
        const components = getComponents();

        return {
            pdfDoc,
            fonts,
            fontStyle,
            components,
            templateURL,
            margin,
            colors,
            fontURL,
            loadFont,
            loadPdf,
            isJPG,
            isPNG,
            calculateImageSize,
            pageSize,
        };
    };

    return initState();
};

module.exports = {
    PdfService
}