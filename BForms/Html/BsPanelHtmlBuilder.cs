﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using BForms.Mvc;

namespace BForms.Html
{
    public class BsPanelHtmlBuilder : BaseComponent
    {
        private string _name;
        private bool _isEditable;
        private bool _isExpanded;
        private bool _isExpandable = true;
        private bool _isLoaded;

        private string _readonlyUrl;
        private string _editableUrl;
        private string _saveUrl;

        private string _content;

        private int _id;
        private IDictionary<string, object> _htmlAttributes;

        /// <summary>
        /// Sets the ViewContext property for the BaseComponent
        /// </summary>
        public BsPanelHtmlBuilder(ViewContext context)
            : base(context)
        { }

        /// <summary>
        /// Sets the display name
        /// </summary>
        public BsPanelHtmlBuilder Name(string name)
        {
            this._name = name;
            return this;
        }


        public BsPanelHtmlBuilder Id(int id)
        {
            this._id = id;
            return this;
        }

        /// <summary>
        /// Specify if the box form has an editable component
        /// </summary>
        public BsPanelHtmlBuilder Editable(bool isEditable)
        {
            this._isEditable = isEditable;
            return this;
        }

        /// <summary>
        /// Specify if the box form is already expanded
        /// </summary>
        public BsPanelHtmlBuilder Expanded(bool isExpanded)
        {
            this._isExpanded = isExpanded;
            return this;
        }

        /// <summary>
        /// Specify if the box form is expandable or static
        /// </summary>
        public BsPanelHtmlBuilder Expandable(bool isExpandable)
        {
            this._isExpandable = isExpandable;
            return this;
        }

        /// <summary>
        /// Specify url from where the readonly form will be loaded
        /// </summary>
        public BsPanelHtmlBuilder ReadonlyUrl(string url)
        {
            this._readonlyUrl = url;
            return this;
        }

        /// <summary>
        /// Specify url from where the editable form will be loaded
        /// It will assume that the box form is editable
        /// </summary>
        public BsPanelHtmlBuilder EditableUrl(string url)
        {
            this._editableUrl = url;
            this._isEditable = true;

            return this;
        }

        public BsPanelHtmlBuilder SaveUrl(string url)
        {
            this._saveUrl = url;

            return this;
        }

        /// <summary>
        /// Sets the content of the box form
        /// It will also set the box as expanded and loaded
        /// </summary>
        public BsPanelHtmlBuilder Content(string content)
        {
            this._content = content;
            this._isExpanded = true;
            this._isLoaded = true;

            return this;
        }

        /// <summary>
        /// Appends html attributes to panel div element
        /// </summary>
        public BsPanelHtmlBuilder HtmlAttributes(Dictionary<string, object> htmlAttributes)
        {
            this._htmlAttributes = htmlAttributes;
            return this;
        }

        /// <summary>
        /// Appends html attributes to panel div element
        /// </summary>
        public BsPanelHtmlBuilder HtmlAttributes(object htmlAttributes)
        {
            this._htmlAttributes = HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes);
            return this;
        }

        /// <summary>
        /// Renders the component
        /// </summary>
        public override string Render()
        {
            var container = new TagBuilder("div");

            container.MergeAttributes(this._htmlAttributes, true);

            if (!String.IsNullOrEmpty(this._editableUrl))
            {
                container.MergeAttribute("data-editableurl", this._editableUrl);
            }

            if (!String.IsNullOrEmpty(this._readonlyUrl))
            {
                container.MergeAttribute("data-readonlyurl", this._readonlyUrl);
            }

            if (!String.IsNullOrEmpty(this._saveUrl))
            {
                container.MergeAttribute("data-saveurl", this._saveUrl);
            }

            container.MergeAttribute("data-component",this._id.ToString());

            container.AddCssClass("panel panel-default");

            var headerTag = new TagBuilder("div");
            headerTag.AddCssClass("panel-heading");

            var headerTitleTag = new TagBuilder("h4");
            headerTitleTag.AddCssClass("panel-title");

            var nameTag = new TagBuilder("a");
            nameTag.AddCssClass("bs-togglePanel");
            nameTag.MergeAttribute("href", "#");

            var loaderImg = new TagBuilder("img");
            loaderImg.MergeAttribute("src", "../Scripts/BForms/Images/preloader-small.gif");
            loaderImg.AddCssClass("bs-panelLoader");

            if (this._isLoaded)
            {
                loaderImg.MergeAttribute("style", "display:none");
            }

            nameTag.InnerHtml += loaderImg.ToString();

            if (this._isExpandable)
            {
                var caretTag = new TagBuilder("span");
                caretTag.AddCssClass("caret bs-panelCaret");

                if (!this._isLoaded)
                {
                    caretTag.MergeAttribute("style", "display:none");
                }

                nameTag.InnerHtml += caretTag.ToString();                

                if (this._isExpanded)
                {
                    nameTag.AddCssClass("dropup");
                }

                nameTag.MergeAttribute("data-expandable", "true");               
            }


            nameTag.InnerHtml += this._name;

            headerTitleTag.InnerHtml += nameTag.ToString();

            if (this._isEditable)
            {
                var editableTag = new TagBuilder("a");
                editableTag.MergeAttribute("href", "#");
                editableTag.AddCssClass("pull-right bs-editPanel");

                var glyphTag = new TagBuilder("span");
                glyphTag.AddCssClass("glyphicon glyphicon-pencil");

                editableTag.InnerHtml += glyphTag.ToString();

                if (!this._isLoaded)
                {
                    editableTag.MergeAttribute("style", "display:none");
                }

                var cancelEditableTag = new TagBuilder("a");
                cancelEditableTag.MergeAttribute("href", "#");
                cancelEditableTag.AddCssClass("pull-right bs-cancelEdit");
                cancelEditableTag.MergeAttribute("style", "display:none");


                var cancelGlyphTag = new TagBuilder("span");
                cancelGlyphTag.AddCssClass("glyphicon glyphicon-remove");

                cancelEditableTag.InnerHtml += cancelGlyphTag.ToString();

                headerTitleTag.InnerHtml += editableTag.ToString();
                headerTitleTag.InnerHtml += cancelEditableTag.ToString();
            }

            headerTag.InnerHtml += headerTitleTag.ToString();
            container.InnerHtml += headerTag.ToString();

            var contentDiv = new TagBuilder("div");
            contentDiv.AddCssClass("panel-collapse bs-containerPanel");

            if (!this._isExpanded)
            {
                contentDiv.AddCssClass("collapse");
            }


            var panelBody = new TagBuilder("div");
            panelBody.AddCssClass("panel-body bs-contentPanel");
            panelBody.InnerHtml += this._content;

            contentDiv.InnerHtml += panelBody.ToString();
            container.InnerHtml += contentDiv.ToString();

            return container.ToString();
        }
    }
}
