﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BForms.Docs.Areas.Demo.Mock;
using BForms.Docs.Areas.Demo.Models;
using BForms.Docs.Resources;
using BForms.Grid;
using BForms.Models;
using BForms.Utilities;
using BForms.Docs.Areas.Demo.Helpers;
using WebGrease.Css.Extensions;

namespace BForms.Docs.Areas.Demo.Repositories
{
    public class ContributorsRepository : BsBaseGridRepository<Contributor, ContributorRowModel>
    {
        #region Properties and Constructor
        private BFormsContext db;

        public BsGridRepositorySettings<ContributorSearchModel> Settings
        {
            get
            {
                return settings as BsGridRepositorySettings<ContributorSearchModel>;
            }
        }

        public ContributorsRepository(BFormsContext _db)
        {
            db = _db;
        }
        #endregion

        #region Mappers
        public Func<Contributor, ContributorRowModel> MapContributor_ContributorRowModel = x =>
            new ContributorRowModel
            {
                Id = x.Id,
                Enabled = x.Enabled,
                Name = x.FirstName + " " + x.LastName,
                Role = x.Role,
                Contributions = x.Contributions,
                StartDate = x.StartDate,
            };

        public Func<Contributor, ContributorDetailsModel> MapContributor_ContributorDetailsModel = x =>
            new ContributorDetailsModel
            {
                Id = x.Id,
                Enabled = x.Enabled,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Languages = x.Languages,
                Url = x.Url,
                Country = x.Country,
                Role = x.Role,
                ContributorSince = x.StartDate,
                Contributions = x.Contributions,
                LanguagesList = Lists.AllLanguages<List<string>>(),
                CountriesList = Lists.AllCounties<string>(false),
                StartDate = new BsDateTime()
                {
                    DateValue = x.StartDate
                }
            };
        #endregion

        #region Filter/Order/Map
        public override IQueryable<Contributor> Query()
        {
            var query = db.Contributors.AsQueryable();

            return Filter(query);
        }

        public override IOrderedQueryable<Contributor> OrderQuery(IQueryable<Contributor> query)
        {
            this.orderedQueryBuilder.OrderFor(x => x.Name, y => y.FirstName + " " + y.LastName);
            var orderedQuery = this.orderedQueryBuilder.Order(query, x => x.StartDate, BsOrderType.Ascending);
            return orderedQuery;
        }

        public override IEnumerable<ContributorRowModel> MapQuery(IQueryable<Contributor> query)
        {
            return query.Select(MapContributor_ContributorRowModel);
        }

        public override void FillDetails(ContributorRowModel row)
        {
            row.Details = db.Contributors.Where(x => x.Id == row.Id).Select(MapContributor_ContributorDetailsModel).FirstOrDefault();

            if (row.Details != null)
            {
                FillDetailsProperties(row.Details);
            }
        }

        public IQueryable<Contributor> Filter(IQueryable<Contributor> query)
        {
            if (!string.IsNullOrEmpty(Settings.QuickSearch))
            {
                //join query with correspondant enum strings
                var roleTypes = Enum.GetValues(typeof(ProjectRole));
                var displayedRoles = new List<KeyValuePair<int, string>>();
                foreach (Enum roleType in roleTypes)
                {
                    var displayName = ReflectionHelpers.EnumDisplayName(typeof(ProjectRole), roleType);
                    displayedRoles.Add(new KeyValuePair<int, string>((int)(ProjectRole)roleType, displayName.ToLower()));
                }

                var searched = Settings.QuickSearch.ToLower();

                //filter by fields that are strings on enums
                var queryQuick = query.Join(displayedRoles, x => (int)x.Role, y => y.Key, (x, y) => new { Contributer = x, RoleText = y });
                queryQuick = queryQuick.Where(x => x.Contributer.FirstName.ToLower().Contains(searched) ||
                                                    x.Contributer.LastName.ToLower().Contains(searched) ||
                                                    x.Contributer.Country.ToLower().Contains(searched) ||
                                                    x.RoleText.Value.Contains(searched) ||
                                                    x.Contributer.Languages != null && x.Contributer.Languages.Any(y => y.Contains(searched)) ||
                                                    x.Contributer.Contributions.Contains(searched));

                //select back TEntity
                query = queryQuick.Select(x => x.Contributer);
            }
            else if (Settings.Search != null)
            {
                #region Name
                if (!string.IsNullOrEmpty(Settings.Search.Name))
                {
                    var name = Settings.Search.Name.ToLower();
                    query = query.Where(x => x.FirstName.ToLower().Contains(name) ||
                                             x.LastName.ToLower().Contains(name));
                }
                #endregion

                #region Enabled
                if (Settings.Search.IsEnabled.SelectedValues.HasValue)
                {
                    var isEnabled = Settings.Search.IsEnabled.SelectedValues.Value;

                    if (isEnabled == YesNoValueTypes.Yes)
                    {
                        query = query.Where(x => x.Enabled);
                    }
                    else if (isEnabled == YesNoValueTypes.No)
                    {
                        query = query.Where(x => !x.Enabled);
                    }
                }
                #endregion

                #region Contributor since range
                if (Settings.Search.StartDateRange != null)
                {
                    var fromDate = Settings.Search.StartDateRange.From;
                    var toDate = Settings.Search.StartDateRange.To;

                    if (fromDate.HasValue)
                    {
                        query = query.Where(x => x.StartDate >= fromDate.Value);
                    }

                    if (toDate.HasValue)
                    {
                        query = query.Where(x => x.StartDate <= toDate.Value);
                    }
                }
                #endregion

                #region Location
                if (Settings.Search.CountriesList != null)
                {
                    var country = Settings.Search.CountriesList.SelectedValues;

                    if (!string.IsNullOrEmpty(country))
                    {
                        query = query.Where(x => x.Country == country);
                    }
                }
                #endregion

                #region Role
                if (Settings.Search.RoleList != null)
                {
                    var role = Settings.Search.RoleList.SelectedValues;

                    if (role.HasValue)
                    {
                        query = query.Where(x => x.Role == role);
                    }
                }
                #endregion

                #region Programming Languages
                if (Settings.Search.LanguagesList != null)
                {
                    var languages = Settings.Search.LanguagesList.SelectedValues;

                    if (languages != null)
                    {
                        query = query.Where(x => x.Languages != null && x.Languages.Any(y => languages.Contains(y)));
                    }
                }
                #endregion
            }

            return query;
        }

        public List<ContributorRowModel> GetItems(BsGridRepositorySettings<ContributorSearchModel> settings, List<int> ids)
        {
            this.settings = settings;

            var result = new List<ContributorRowModel>();

            // create filtered query
            var basicQuery = this.Query();

            if (ids != null && ids.Any())
            {
                basicQuery = basicQuery.Where(x => ids.Contains(x.Id));
            }
            else
            {
                basicQuery = Filter(basicQuery);
            }

            IEnumerable<ContributorRowModel> finalQuery = null;

            // order
            var orderedExcelQueryBuilder = new OrderedQueryBuilder<ContributorRowModel>(this.settings.OrderableColumns);

            orderedExcelQueryBuilder.OrderFor(x => x.Name, y => y.FirstName + " " + y.LastName);

            var orderedQuery = orderedExcelQueryBuilder.Order(basicQuery, x => x.StartDate, BsOrderType.Ascending);

            // map
            finalQuery = orderedQuery.Select(MapContributor_ContributorRowModel).ToList();

            result = finalQuery.ToList();

            return result;
        }
        #endregion

        #region CRUD
        public ContributorRowModel Create(ContributorNewModel model)
        {
            var entity = new Contributor
            {
                Id = db.Contributors.Count() + 1,
                Enabled = model.IsEnabled == YesNoValueTypes.Yes,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Country = model.CountriesList.SelectedValues,
                Contributions = model.Contributions,
                Role = model.RoleList.SelectedValues.Value,
                Languages = model.LanguagesList.SelectedValues,
                StartDate = model.StartDate.DateValue.Value,
                Url = model.Url
            };
            db.Contributors.Add(entity);
            db.SaveChanges();

            return MapContributor_ContributorRowModel(entity);
        }

        public ContributorRowModel ReadRow(int objId)
        {
            return db.Contributors.Where(x => x.Id == objId).Select(MapContributor_ContributorRowModel).FirstOrDefault();
        }

        public List<ContributorDetailsModel> ReadDetails(List<int> ids)
        {
            var list = db.Contributors.Where(x => ids.Contains(x.Id)).Select(MapContributor_ContributorDetailsModel).ToList();
            list.ForEach(x=>FillDetailsProperties(x));
            return list;
        }

        public List<ContributorRowModel> ReadRows(List<int> objIds)
        {
            return db.Contributors.Where(x => objIds.Contains(x.Id)).Select(MapContributor_ContributorRowModel).ToList();
        }

        public ContributorDetailsModel Update(ContributorDetailsModel model, int objId, EditComponents componentId)
        {
            var entity = db.Contributors.FirstOrDefault(x => x.Id == objId);

            if (entity != null)
            {
                switch (componentId)
                {
                    case EditComponents.Identity:
                        entity.FirstName = model.FirstName;
                        entity.LastName = model.LastName;
                        entity.Url = model.Url;
                        entity.Country = model.CountriesList.SelectedValues;
                        break;
                    case EditComponents.ProjectRelated:
                        entity.Role = model.RoleList.SelectedValues.Value;
                        entity.StartDate = model.StartDate.DateValue.Value;
                        entity.Languages = model.LanguagesList.SelectedValues;
                        entity.Contributions = model.Contributions;
                        break;
                }
                db.SaveChanges();
            }

            return FillDetailsProperties(MapContributor_ContributorDetailsModel(entity));
        }

        public void EnableDisable(int objId, bool? enable)
        {
            var entity = db.Contributors.FirstOrDefault(x => x.Id == objId);

            if (entity != null)
            {
                entity.Enabled = enable.HasValue ? enable.Value : !entity.Enabled;
                db.SaveChanges();
            }
        }

        public void Delete(int objId)
        {
            var entity = db.Contributors.FirstOrDefault(x => x.Id == objId);

            if (entity != null)
            {
                db.Contributors.Remove(entity);
                db.SaveChanges();
            }
        }
        #endregion

        #region Helpers
        [System.Diagnostics.DebuggerHidden()]
        public ContributorSearchModel GetSearchForm()
        {
            return new ContributorSearchModel()
            {
                CountriesList = Lists.AllCounties<string>(false),
                LanguagesList = Lists.AllLanguages<List<string>>(),
                StartDateRange = new BsRange<DateTime?>()
                {
                    From = new DateTime(2013, 8, 1),
                    To = DateTime.Now
                }
            };
        }

        public ContributorNewModel GetNewForm()
        {
            return new ContributorNewModel()
            {
                CountriesList = Lists.AllCounties<string>(false),
                LanguagesList = Lists.AllLanguages<List<string>>()
            };
        }

        public ContributorDetailsModel FillDetailsProperties(ContributorDetailsModel model)
        {
            model.LanguagesList.SelectedValues = model.Languages;
            model.RoleList.SelectedValues = model.Role;
            model.CountriesList.SelectedValues = model.Country;

            return model;
        }
        #endregion
    }
}