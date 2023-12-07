import { parse } from "url";

class APIFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const { keyword } = this.query;
    if (keyword) {
      this.query.$text = { $search: keyword };
      delete this.query.keyword; 
    }
    return this;
  }

  filters() {
    const queryCopy = { ...this.queryStr };
  
    // Fields to remove
    const fieldsToRemove = ["keyword", "page"];
    fieldsToRemove.forEach((el) => {
      delete queryCopy[el];
    });
  
    Object.keys(queryCopy).forEach((key) => {
      const newKey = `attributes.${key}`;
  
      if (key === "min" || key === "max") {
        if (key === "min") {
          queryCopy["attributes.price"] = { $gte: Number(queryCopy[key]) };
        } else if (key === "max") {
          queryCopy["attributes.price"] = { $lte: Number(queryCopy[key]) };
        }
        delete queryCopy[key];
      } else if (key === "rating") {
        queryCopy[newKey] = { $gte: Number(queryCopy[key]) };
        delete queryCopy[key];
      } else if (key === "category") {
        // Handle multiple values for category (comma-separated)
        const values = queryCopy[key].split(",");
        queryCopy["$or"] = values.map(value => ({ [newKey]: value }));
        delete queryCopy[key];
      } else {
        queryCopy[newKey] = queryCopy[key];
        delete queryCopy[key];
      }
    });
  
    // Advanced filter for price, ratings, etc.
    let queryStr = JSON.stringify(queryCopy);
    this.query = this.query.find(JSON.parse(queryStr));
  
    return this;
  }
  
  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}


export default APIFilters