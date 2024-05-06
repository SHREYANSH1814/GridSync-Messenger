const conversation = require("../models/converstionsmodel");
const getcid = async (id1, id2, msg) => {
  var cid;
  var data = await conversation.findOne({ members: { $all: [id1, id2] } });
  if (!data) {
    data = await conversation.save({
      members: [id1, id2],
    });
  }

  await conversation.findOneandUpdate({ _id: data._id }, { message: msg });

  return data._id;
};
module.exports = getcid;
