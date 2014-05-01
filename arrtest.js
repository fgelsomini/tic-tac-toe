
function permutate(array, size, permutations) {
  var permutations = permutations || [];
  for(var i=0;i<array.length;i++) {
    arrayCopy = array.slice(0);
    if (arrayCopy.length > size) {
      arrayCopy = array.filter(function(e) {return e !== array[i]})
    }
    if (arrayCopy.length === size) {
      permutationExists = permutations.some(function(e) {
        return JSON.stringify(e) === JSON.stringify(arrayCopy.sort())
      });
      if (permutationExists === false) {
        permutations.push(arrayCopy.sort());    
      }
    }
    while (arrayCopy.length > size) {
      permutate(arrayCopy,size,permutations);
    }
  }
  return permutations;
}

function sumArray(array) {
  array.reduce(function(a, b) {
    return a + b;
  });
}

var a = [2,4,5,6,9];
var ps = permutate(a, 3);
console.log(ps.sort());
