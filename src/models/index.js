/**
 * Models index file - School project models
 */

const Student = require('./Student');
const Course = require('./Course');
const Teacher = require('./Teacher');
const Club = require('./Club');
const Review = require('./Review');
const CoursePlan = require('./CoursePlan');
const ChatConversation = require('./ChatConversation');

module.exports = {
  Student,
  Course,
  Teacher,
  Club,
  Review,
  CoursePlan,
  ChatConversation
};
