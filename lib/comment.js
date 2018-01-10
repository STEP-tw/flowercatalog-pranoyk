class Comment {
  constructor(name,comment) {
    this.date = undefined;
    this.time = undefined;
    this.name = name;
    this.comment= comment;
  }
  getDateAndTime() {
    let date = new Date();
    let dateAndTime = date.toLocaleString();
    this.date = dateAndTime.split(',')[0];
    this.time = dateAndTime.split(',')[1];
  }
  getComment() {
    this.getDateAndTime();
    return this;
  }
}

module.exports=Comment;9
