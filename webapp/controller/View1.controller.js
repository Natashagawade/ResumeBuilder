sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/core/Theming"
], function (Controller, JSONModel, Fragment, MessageToast, Theming) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {
            const oResumeModel = new JSONModel({
                personal: {},
                experience: [],
                education: [],
                projects: [],
                certifications: [],
                skills: "",
                links: ""
            });
            this.getView().setModel(oResumeModel, "resume");

            const oDeviceModel = new JSONModel({ isNoPhone: !sap.ui.Device.system.phone });
            this.getView().setModel(oDeviceModel, "device");

            const oDialogModel = new JSONModel({});
            this.getView().setModel(oDialogModel, "dialog");

            const oSettingsModel = new JSONModel({
                colorScheme: "purple",
                fontSize: "medium",
                fontStyle: "helvetica",
                showSummary: true,
                showExperience: true,
                showEducation: true,
                showProjects: true,
                showCertifications: true,
                showSkills: true,
                showLinks: true
            });
            this.getView().setModel(oSettingsModel, "settings");
        },

        onPhotoUpload: function (oEvent) {
            const oFile = oEvent.getParameter("files")[0];
            if (oFile) {
                const oReader = new FileReader();
                oReader.onload = (e) => {
                    this.getView().getModel("resume").setProperty("/personal/photo", e.target.result);
                    MessageToast.show("Photo uploaded successfully.");
                };
                oReader.readAsDataURL(oFile);
            }
        },

        _openDialog: function (sDialogName) {
            this.getView().getModel("dialog").setData({});
            const sFragmentName = `project1.view.${sDialogName}Dialog`;
            const sDialogProp = `p${sDialogName}Dialog`;

            if (!this[sDialogProp]) {
                this[sDialogProp] = Fragment.load({
                    id: this.getView().getId(),
                    name: sFragmentName,
                    controller: this
                }).then(oDialog => {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                });
            }
            this[sDialogProp].then(oDialog => oDialog.open());
        },

        _saveDialogData: function (sModelPath, aRequiredFields, sDialogName) {
            const oDialogData = this.getView().getModel("dialog").getData();

            for (let field of aRequiredFields) {
                if (!oDialogData[field]) {
                    MessageToast.show(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`);
                    return;
                }
            }

            const oModel = this.getView().getModel("resume");
            const aItems = oModel.getProperty(`/${sModelPath}`);
            aItems.push(oDialogData);
            oModel.refresh(true);
            MessageToast.show(`${sDialogName} saved.`);
            this._closeDialog(sDialogName);
        },
        
        _closeDialog: function (sDialogName) {
            const sDialogProp = `p${sDialogName}Dialog`;
            if (this[sDialogProp]) {
                this[sDialogProp].then(oDialog => oDialog.close());
            }
        },

        onAddExperience: function () { this._openDialog("Experience"); },
        onSaveExperience: function () { this._saveDialogData("experience", ["jobTitle", "company"], "Experience"); },
        onCloseExperienceDialog: function () { this._closeDialog("Experience"); },

        onAddEducation: function () { this._openDialog("Education"); },
        onSaveEducation: function () { this._saveDialogData("education", ["degree", "university"], "Education"); },
        onCloseEducationDialog: function () { this._closeDialog("Education"); },

        onAddProject: function () { this._openDialog("Project"); },
        onSaveProject: function () { this._saveDialogData("projects", ["title"], "Project"); },
        onCloseProjectDialog: function () { this._closeDialog("Project"); },

        onAddCertification: function () { this._openDialog("Certification"); },
        onSaveCertification: function () { this._saveDialogData("certifications", ["name"], "Certification"); },
        onCloseCertificationDialog: function () { this._closeDialog("Certification"); },
        onCertificateUpload: function (oEvent) {
            const oFile = oEvent.getParameter("files")[0];
            if (oFile) {
                const oReader = new FileReader();
                oReader.onload = (e) => {
                    this.getView().getModel("dialog").setProperty("/file", e.target.result);
                    MessageToast.show("Certificate file attached.");
                };
                oReader.readAsDataURL(oFile);
            }
        },

        _deleteListItem: function (oEvent, sModelPath) {
            const oListItem = oEvent.getSource().getBindingContext("resume").getObject();
            const oModel = this.getView().getModel("resume");
            const aItems = oModel.getProperty("/" + sModelPath);
            const iIndex = aItems.indexOf(oListItem);
            if (iIndex > -1) {
                aItems.splice(iIndex, 1);
                oModel.refresh(true);
            }
        },
        _moveListItem: function (oEvent, sModelPath, iDirection) {
            const oListItem = oEvent.getSource().getBindingContext("resume").getObject();
            const oModel = this.getView().getModel("resume");
            const aItems = oModel.getProperty("/" + sModelPath);
            const iIndex = aItems.indexOf(oListItem);
            const iNewIndex = iIndex + iDirection;
            if (iNewIndex < 0 || iNewIndex >= aItems.length) { return; }
            const oItem = aItems[iIndex];
            aItems.splice(iIndex, 1);
            aItems.splice(iNewIndex, 0, oItem);
            oModel.refresh(true);
        },
        onDeleteExperience: function (oEvent) { this._deleteListItem(oEvent, "experience"); },
        onMoveExperienceUp: function (oEvent) { this._moveListItem(oEvent, "experience", -1); },
        onMoveExperienceDown: function (oEvent) { this._moveListItem(oEvent, "experience", 1); },
        onDeleteEducation: function (oEvent) { this._deleteListItem(oEvent, "education"); },
        onMoveEducationUp: function (oEvent) { this._moveListItem(oEvent, "education", -1); },
        onMoveEducationDown: function (oEvent) { this._moveListItem(oEvent, "education", 1); },
        onDeleteProject: function (oEvent) { this._deleteListItem(oEvent, "projects"); },
        onMoveProjectUp: function (oEvent) { this._moveListItem(oEvent, "projects", -1); },
        onMoveProjectDown: function (oEvent) { this._moveListItem(oEvent, "projects", 1); },
        onDeleteCertification: function (oEvent) { this._deleteListItem(oEvent, "certifications"); },
        onMoveCertificationUp: function (oEvent) { this._moveListItem(oEvent, "certifications", -1); },
        onMoveCertificationDown: function (oEvent) { this._moveListItem(oEvent, "certifications", 1); },

        onThemeSwitch: function (oEvent) {
            const bState = oEvent.getParameter("state");
            Theming.setTheme(bState ? "sap_horizon_dark" : "sap_horizon");
        },
        onClearForm: function () {
            this.getView().getModel("resume").setData({
                personal: {}, experience: [], education: [], projects: [], certifications: [], skills: "", links: ""
            });
            MessageToast.show("Form cleared.");
        },

        onGeneratePdf: function () {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF("p", "mm", "a4");
            const oResumeData = this.getView().getModel("resume").getData();
            const oSettings = this.getView().getModel("settings").getData();
            
            const colorPalettes = {
                purple: { primary: [83, 28, 117], light: [237, 231, 246] },
                blue: { primary: [0, 57, 108], light: [227, 242, 253] },
                gray: { primary: [84, 84, 84], light: [245, 245, 245] }
            };
            const fontSizes = {
                small: { h1: 22, h2: 14, h3: 11, p: 9, footer: 8 },
                medium: { h1: 26, h2: 16, h3: 12, p: 10, footer: 9 },
                large: { h1: 30, h2: 18, h3: 13, p: 11, footer: 10 }
            };
        
            const theme = colorPalettes[oSettings.colorScheme];
            const fonts = fontSizes[oSettings.fontSize];
            const fontStyle = oSettings.fontStyle;
            const black = [0, 0, 0], gray = [100, 100, 100];
            const leftMargin = 20, contentWidth = 170;
            const pageHeight = 295, headerHeight = 45, footerHeight = 25;
            const topMargin = 20, bottomMargin = 20;
            let yPos;
        
            const drawHeader = () => {
                doc.setFillColor(theme.light[0], theme.light[1], theme.light[2]);
                doc.rect(0, 0, 210, headerHeight, 'F');
        
                if (oResumeData.personal.photo) {
                    const photoSize = 35;
                    const photoX = 155;
                    const photoY = (headerHeight - photoSize) / 2;
                    const getImageFormat = (base64) => {
                        if (!base64 || !base64.startsWith('data:image/')) return 'JPEG';
                        return base64.substring(base64.indexOf('/') + 1, base64.indexOf(';')).toUpperCase();
                    };
                    const photoFormat = getImageFormat(oResumeData.personal.photo);
                    doc.addImage(oResumeData.personal.photo, photoFormat, photoX, photoY, photoSize, photoSize);
                    doc.setLineWidth(0.5);
                    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
                    doc.rect(photoX, photoY, photoSize, photoSize);
                }
        
                let tempY = 20;
                doc.setFontSize(fonts.h1);
                doc.setFont(fontStyle, "bold");
                doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
                doc.text(oResumeData.personal.fullName, leftMargin, tempY);
                tempY += (fonts.h1 / 2.5);
                
                doc.setFontSize(fonts.p);
                doc.setFont(fontStyle, "normal");
                doc.setTextColor(black[0], black[1], black[2]);
                doc.text(`Email: ${oResumeData.personal.email}`, leftMargin, tempY); tempY += 7;
                doc.text(`Phone: ${oResumeData.personal.phone}`, leftMargin, tempY);
            };
        
            const drawFooter = () => {
                const footerY = pageHeight - footerHeight;
                doc.setFillColor(theme.light[0], theme.light[1], theme.light[2]);
                doc.rect(0, footerY, 210, footerHeight, 'F');
        
                const getUsername = (url) => {
                    if (!url) return "";
                    try {
                        return new URL(url).pathname.split('/').filter(Boolean).pop();
                    } catch (e) {
                        return url; 
                    }
                };
                
                if (oSettings.showLinks && oResumeData.links) {
                    const linksArray = oResumeData.links.split('\n').map(link => getUsername(link.trim()));
                    const socialText = linksArray.filter(Boolean).join("   \u2022   ");
                    doc.setFontSize(fonts.p - 1);
                    doc.setFont(fontStyle, "bold");
                    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
                    doc.text(socialText, 105, footerY + 10, { align: 'center' });
                }
        
                doc.setFontSize(fonts.footer);
                doc.setFont(fontStyle, "italic");
                doc.setTextColor(gray[0], gray[1], gray[2]);
                doc.text("I declare to improve my knowledge if required", 105, footerY + 18, { align: 'center' });
            };
        
            const checkPageBreak = (requiredHeight) => {
                if (yPos + requiredHeight > pageHeight - bottomMargin) {
                    doc.addPage();
                    yPos = topMargin;
                }
            };
        
            const drawSectionHeader = (text) => {
                checkPageBreak(20);
                doc.setFontSize(fonts.h2);
                doc.setFont(fontStyle, "bold");
                doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
                doc.text(text, leftMargin, yPos);
                yPos += 2;
                doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
                doc.setLineWidth(0.2);
                doc.line(leftMargin, yPos, leftMargin + contentWidth, yPos);
                yPos += 8;
            };
        
            // --- Start Drawing Document ---
            drawHeader();
            yPos = headerHeight + 15;
        
            if (oSettings.showSummary && oResumeData.personal.summary) {
                const summaryLines = doc.splitTextToSize(oResumeData.personal.summary, contentWidth);
                const sectionHeight = 20 + (summaryLines.length * (fonts.p / 2));
                checkPageBreak(sectionHeight);
                drawSectionHeader("Summary");
                doc.setFontSize(fonts.p);
                doc.setFont(fontStyle, "normal");
                doc.setTextColor(black[0], black[1], black[2]);
                doc.text(summaryLines, leftMargin, yPos);
                yPos += (summaryLines.length * (fonts.p / 2)) + 5;
            }
        
            if (oSettings.showExperience && oResumeData.experience.length > 0) {
                let totalHeight = 20;
                oResumeData.experience.forEach(exp => {
                    const expLines = doc.splitTextToSize(exp.description, contentWidth);
                    totalHeight += 11 + (expLines.length * (fonts.p / 2)) + 6;
                });
                checkPageBreak(totalHeight);
                drawSectionHeader("Work Experience");
                oResumeData.experience.forEach(exp => {
                    doc.setFontSize(fonts.h3);
                    doc.setFont(fontStyle, "bold");
                    doc.setTextColor(black[0], black[1], black[2]);
                    doc.text(exp.jobTitle, leftMargin, yPos);
                    yPos += 5;
                    doc.setFontSize(fonts.p);
                    doc.setFont(fontStyle, "italic");
                    doc.setTextColor(gray[0], gray[1], gray[2]);
                    doc.text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`, leftMargin, yPos);
                    yPos += 6;
                    doc.setFont(fontStyle, "normal");
                    doc.setTextColor(black[0], black[1], black[2]);
                    const expLines = doc.splitTextToSize(exp.description, contentWidth);
                    doc.text(expLines, leftMargin, yPos);
                    yPos += (expLines.length * (fonts.p / 2)) + 6;
                });
            }
        
            if (oSettings.showEducation && oResumeData.education.length > 0) {
                const sectionHeight = 20 + (oResumeData.education.length * 15);
                checkPageBreak(sectionHeight);
                drawSectionHeader("Education");
                oResumeData.education.forEach(edu => {
                    doc.setFontSize(fonts.h3);
                    doc.setFont(fontStyle, "bold");
                    doc.setTextColor(black[0], black[1], black[2]);
                    doc.text(edu.degree, leftMargin, yPos);
                    yPos += 5;
                    doc.setFontSize(fonts.p);
                    doc.setFont(fontStyle, "italic");
                    doc.setTextColor(gray[0], gray[1], gray[2]);
                    doc.text(`${edu.university} | ${edu.startDate} - ${edu.endDate}`, leftMargin, yPos);
                    yPos += 10;
                });
            }
        
            if (oSettings.showProjects && oResumeData.projects.length > 0) {
                let totalHeight = 20;
                oResumeData.projects.forEach(proj => {
                     const descLines = doc.splitTextToSize(proj.description, contentWidth);
                     totalHeight += 5 + (descLines.length * (fonts.p / 2)) + (proj.link ? 10 : 0);
                });
                checkPageBreak(totalHeight);
                drawSectionHeader("Projects");
                oResumeData.projects.forEach(proj => {
                    doc.setFontSize(fonts.h3);
                    doc.setFont(fontStyle, "bold");
                    doc.setTextColor(black[0], black[1], black[2]);
                    doc.text(proj.title, leftMargin, yPos);
                    yPos += 5;
                    doc.setFontSize(fonts.p);
                    doc.setFont(fontStyle, "normal");
                    doc.setTextColor(black[0], black[1], black[2]);
                    const descLines = doc.splitTextToSize(proj.description, contentWidth);
                    doc.text(descLines, leftMargin, yPos);
                    yPos += (descLines.length * (fonts.p / 2)) + 2;
                    if (proj.link) {
                        doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
                        doc.textWithLink(proj.link, leftMargin, yPos, { url: proj.link });
                        yPos += 8;
                    }
                });
            }
        
            if (oSettings.showCertifications && oResumeData.certifications.length > 0) {
                const sectionHeight = 20 + (oResumeData.certifications.length * 15);
                checkPageBreak(sectionHeight);
                drawSectionHeader("Certifications");
                oResumeData.certifications.forEach(cert => {
                    doc.setFontSize(fonts.h3);
                    doc.setFont(fontStyle, "bold");
                    doc.setTextColor(black[0], black[1], black[2]);
                    doc.text(cert.name, leftMargin, yPos);
                    yPos += 5;
                    doc.setFontSize(fonts.p);
                    doc.setFont(fontStyle, "italic");
                    doc.setTextColor(gray[0], gray[1], gray[2]);
                    doc.text(`${cert.issuer} | ${cert.date}`, leftMargin, yPos);
                    yPos += 10;
                });
            }
        
            if (oSettings.showSkills && oResumeData.skills) {
                const skillsArray = oResumeData.skills.split(',').map(skill => skill.trim());
                const sectionHeight = 20 + (skillsArray.length * 6);
                checkPageBreak(sectionHeight);
                drawSectionHeader("Skills");
                doc.setFontSize(fonts.p);
                doc.setFont(fontStyle, "normal");
                doc.setTextColor(black[0], black[1], black[2]);
                skillsArray.forEach(skill => {
                    if (skill) {
                        doc.text(`\u2022 ${skill}`, leftMargin, yPos);
                        yPos += 6;
                    }
                });
            }
        
            drawFooter();
            doc.save(`${oResumeData.personal.fullName || "Resume"}_Resume.pdf`);
        }
                
    });
});