const { layoutMultilineText, TextAlignment } = require("pdf-lib");
const fetch = require("node-fetch")
const { PdfService } = require('../services/pdf');

const DiceRollerPDF = () => {
    const diceRoller = {
        dice: {
            left: 20,
            top: 250,
            width: 116,
            height: 115,
        },
        img: {
            width: 38,
            height: 38,
        },
    };

    const addBasicPage = (
        pageNumber,
        worksheet,
        page,
        pdfService,
    ) => {
        const titleFooterWidth = pdfService.components.footer.title.font.widthOfTextAtSize(
            worksheet.title,
            pdfService.components.footer.title.size,
        );

        const titleFooterX = pdfService.pageSize.width - 50 - titleFooterWidth;

        page.drawText(worksheet.title, pdfService.components.header.title);
        page.drawText((pageNumber + 1).toString(), pdfService.components.header.page);
        page.drawText(worksheet.title, {
            ...pdfService.components.footer.title,
            x: titleFooterX,
        });
        page.drawText((pageNumber + 1).toString(), pdfService.components.footer.page);
    };

    const addInstruction = (text, index, page, pdfService) => {
        page.drawText(`${index})`, {
            x: 119,
            y: pdfService.pageSize.height - 140 - (index - 1) * 30,
            maxWidth: pdfService.pageSize.width - 130 - pdfService.margin,
            ...pdfService.fontStyle.regular,
        });
        page.drawText(text, {
            x: 119 + 20,
            y: pdfService.pageSize.height - 140 - (index - 1) * 30,
            maxWidth: pdfService.pageSize.width - 130 - pdfService.margin,
            ...pdfService.fontStyle.regular,
        });
    };

    const addTextDice = (
        text,
        gridX,
        gridY,
        fontSize,
        marginTop,
        page,
        pdfService,
    ) => {
        const basePosition = gridY * diceRoller.dice.height + diceRoller.dice.top + 30 + marginTop;
        const multilineTextLayout = layoutMultilineText(text, {
            alignment: TextAlignment.Center,
            fontSize,
            bounds: {
                x: gridX * diceRoller.dice.width + diceRoller.dice.left,
                y: pdfService.pageSize.height - basePosition,
                width: diceRoller.dice.width - 10,
                height: diceRoller.dice.height,
            },
            font: pdfService.fontStyle.regular.font,
        });

        multilineTextLayout.lines.forEach((line) => {
            page.drawText(line.text, {
                x: line.x,
                y: line.y,
                ...pdfService.fontStyle.regular,
                size: fontSize,
            });
        });

    };

    const addImageDice = async(
        imageURL,
        gridX,
        gridY,
        page,
        pdfService,
    ) => {
        const imageBytes = await fetch(imageURL).then((res) => res.arrayBuffer());

        let image;
        if (pdfService.isJPG(imageURL)) image = await pdfService.pdfDoc.embedJpg(imageBytes);
        if (pdfService.isPNG(imageURL)) image = await pdfService.pdfDoc.embedPng(imageBytes);

        const imageSize = pdfService.calculateImageSize(image, diceRoller.img);
        const marginAuto = (diceRoller.img.width - imageSize.width) / 2;

        page.drawImage(image, {
            x: gridX * diceRoller.dice.width + diceRoller.dice.left + marginAuto + 38,
            y: pdfService.pageSize.height - gridY * diceRoller.dice.height - diceRoller.dice.top,
            width: imageSize.width,
            height: imageSize.height,
        });
    };

    const addDice = async(
        card,
        gridX,
        gridY,
        page,
        pdfService,
    ) => {
        if (card.imageURL) {
            await addImageDice(card.imageURL, gridX, gridY, page, pdfService);

            await addTextDice(card.prompt, gridX, gridY, 11, 0, page, pdfService);
        } else {
            await addTextDice(card.prompt, gridX, gridY, 13, 15, page, pdfService);
        }
    };

    const addPage = async(pageNumber, worksheet, pdfService) => {
        const page = await pdfService.loadPdf(
            pdfService.templateURL.diceRoller.first,
            pdfService.pdfDoc,
        );

        addBasicPage(pageNumber, worksheet, page, pdfService);

        worksheet.instruction.forEach((instruction, index) => {
            addInstruction(instruction, index + 1, page, pdfService);
        });

        const cardPromises = worksheet.cards.map(async(card, index) => {
            let gridX = 1;
            let gridY = 1;
            if (index < 4) {
                gridX = 2;
                gridY = index + 1;
            } else {
                gridX = index === 5 ? 1 : 3;
                gridY = 3;
            }
            await addDice(card, gridX, gridY, page, pdfService);
        });

        await Promise.all(cardPromises);

        pdfService.pdfDoc.addPage(page);
    };

    const pdfTitle = (title) => {
        let text = title.toLowerCase();
        text = text.trim();
        text = text.replaceAll(' ', '_');
        return text;
    };

    async function createPDF(worksheet) {
        const pdfService = await PdfService();

        await addPage(0, worksheet, pdfService);

        try {
            const pdfBytes = await pdfService.pdfDoc.save();
            return Promise.resolve(pdfBytes);
        } catch {
            return Promise.reject();
        }
    }

    return { createPDF };
};

module.exports = {
    DiceRollerPDF
}