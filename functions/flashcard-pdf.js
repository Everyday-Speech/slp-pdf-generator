const { PdfService } = require('../services/pdf');
const fetch = require("node-fetch")
const {
    layoutMultilineText,
    TextAlignment,
} = require("pdf-lib");

const FlashcardPDF = () => {
    const flashcard = {
        width: 271,
        height: 181,
        top: 354,
        left: 37,
        img: {
            width: 206,
            height: 103,
            left: 33,
            top: 110,
        },
        number: { left: 12 },
        title: { top: 125 },
    };


    const addImageCard = async(
        imageURL,
        marginLeft,
        marginTop,
        cardIndex,
        page,
        pdfService,
    ) => {
        const imageBytes = await fetch(imageURL).then((res) => res.arrayBuffer());

        let image;
        if (pdfService.isJPG(imageURL)) image = await pdfService.pdfDoc.embedJpg(imageBytes);
        if (pdfService.isPNG(imageURL)) image = await pdfService.pdfDoc.embedPng(imageBytes);

        const imageSize = pdfService.calculateImageSize(image, flashcard.img);
        const marginAuto = (flashcard.img.width - imageSize.width) / 2;

        page.drawImage(image, {
            x: flashcard.left + marginLeft + marginAuto,
            y: pdfService.pageSize.height - (flashcard.top + marginTop) - flashcard.height * cardIndex,
            width: imageSize.width,
            height: imageSize.height,
        });
    };

    const addTitleCard = async(
        text,
        marginLeft,
        marginTop,
        cardIndex,
        page,
        pdfService,
    ) => {
        const titleWidth = pdfService.fontStyle.title.font.widthOfTextAtSize(
            text,
            pdfService.fontStyle.title.size,
        );
        page.drawText(text, {
            x: flashcard.left + (flashcard.width - titleWidth) / 2 + marginLeft,
            y: pdfService.pageSize.height - (flashcard.top + marginTop) - flashcard.height * cardIndex,
            ...pdfService.fontStyle.title,
        });
    };

    const addDescriptionCard = async(
        text,
        marginLeft,
        marginTop,
        cardIndex,
        page,
        pdfService,
    ) => {
        const basePosition = flashcard.top + marginTop;
        const cardsIncrements = flashcard.height * (cardIndex + 1);
        const multilineTextLayout = layoutMultilineText(text, {
            alignment: TextAlignment.Center,
            fontSize: 10,
            bounds: {
                x: flashcard.left + marginLeft,
                y: pdfService.pageSize.height - basePosition - cardsIncrements,
                width: flashcard.width,
                height: flashcard.height,
            },
            font: pdfService.fontStyle.regular.font,
        });

        multilineTextLayout.lines.forEach((line) => {
            page.drawText(line.text, {
                x: line.x,
                y: line.y,
                ...pdfService.fontStyle.regular,
                size: 10,
            });
        });
    };

    const addCardNumber = (cardId, x, y, page, pdfService) => {
        page.drawCircle({
            x: x + 4,
            y: y + 4,
            size: 10,
            color: pdfService.colors.blue,
        });

        page.drawText(cardId.toString(), {
            x,
            y,
            ...pdfService.fontStyle.bold,
        });
    };

    const addCard = async(
        index,
        cardId,
        card,
        page,
        pdfService,
    ) => {
        addCardNumber(
            cardId,
            flashcard.left + flashcard.number.left,
            pdfService.pageSize.height - (flashcard.top + 17) - flashcard.height * index,
            page,
            pdfService,
        );

        await addImageCard(
            card.front.imageURL,
            flashcard.img.left,
            flashcard.img.top,
            index,
            page,
            pdfService,
        );

        await addTitleCard(card.front.title, 0, 125, index, page, pdfService);
        await addDescriptionCard(card.front.text, 0, 127, index, page, pdfService);

        if (card.back.imageURL) {
            await addImageCard(
                card.back.imageURL,
                flashcard.img.left + flashcard.width,
                flashcard.img.top + 20,
                index,
                page,
                pdfService,
            );

            await addTitleCard(card.back.title, flashcard.width, 15, index, page, pdfService);
            await addDescriptionCard(card.front.text, flashcard.width, 130, index, page, pdfService);
        } else if (card.back.title) {
            await addTitleCard(
                card.back.text,
                flashcard.width,
                flashcard.height / 2 - 10,
                index,
                page,
                pdfService,
            );
            await addDescriptionCard(
                card.front.text,
                flashcard.width,
                flashcard.height / 2 + 10,
                index,
                page,
                pdfService,
            );
        } else {
            await addDescriptionCard(
                card.front.text,
                flashcard.width,
                flashcard.height / 2 - 10,
                index,
                page,
                pdfService,
            );
        }
    };

    const addBasicPage = (
        pageNumber,
        worksheet,
        page,
        pdfService,
    ) => {
        page.drawText(worksheet.title, pdfService.components.header.title);
        page.drawText((pageNumber + 1).toString(), pdfService.components.header.page);
        page.drawText(worksheet.title, pdfService.components.footer.title);
        page.drawText((pageNumber + 1).toString(), pdfService.components.footer.page);
    };

    const addPage = async(pageNumber, worksheet, pdfService) => {
        const page = await pdfService.loadPdf(
            pageNumber === 0 ?
            pdfService.templateURL.flashcard.first :
            pdfService.templateURL.flashcard.others,
            pdfService.pdfDoc,
        );

        addBasicPage(pageNumber, worksheet, page, pdfService);
        if (pageNumber > 0) flashcard.top = 142;

        if (pageNumber === 0) {
            page.drawText(worksheet.description, pdfService.components.description);
        }
        const cards = pageNumber === 0 ? 2 : 3;
        const cardStart = pageNumber === 0 ? 0 : 2 + 3 * (pageNumber - 1);

        const cardPromises = worksheet.cards
            .slice(cardStart, cardStart + cards)
            .map(async(card, index) => {
                await addCard(index, index + cardStart + 1, card, page, pdfService);
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
        await addPage(1, worksheet, pdfService);

        if (worksheet.cards.length > 5) await addPage(2, worksheet, pdfService);
        if (worksheet.cards.length > 8) await addPage(3, worksheet, pdfService);
        if (worksheet.cards.length > 11) await addPage(4, worksheet, pdfService);

        try {
            const pdfBytes = await pdfService.pdfDoc.save();
            return Promise.resolve(pdfService.pdfDoc);
        } catch {
            return Promise.reject();
        }
    }

    return { createPDF };
};

module.exports = {
    FlashcardPDF
}