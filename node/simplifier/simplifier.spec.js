const simplifier = require("./simplifier.js")

describe("A suite is just a function", () => {
  it("simpe Char", function() {
    const input = "123"
    const expected = ["123"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  it("escaped Char", function() {
    const input = "1\."
    const expected = ["1\."]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  it("simpe Disjunction", function() {
    const input = "1(2|3)4"
    const expected = ["124", "134"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  it("double Disjunction", function() {
    const input = "1(2|3|4)5"
    const expected = ["125", "135", "145"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  it("optional", function() {
    const input = "1(2)?3"
    const expected = ["13", "123"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  // redundant?
  it("optional Disjunction", function() {
    const input = "1(2|3)?4"
    const expected = ["14", "124", "134"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  it("optional Disjunction", function() {
    const input = "1(?:2)3"
    const expected = ["123"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  // redundant?
  it("optional Disjunction", function() {
    const input = "1(?:2)?3"
    const expected = ["13", "123"]
    const list = simplifier.explode(input)

    expect(list).toEqual(expected)
  })

  it("stress test", function() {
    const data = require("./default.json")
    const list = simplifier.explode("1(?:2)?3")


    expect(list.length).toBe(2)
    expect(list[0]).toBe("13")
    expect(list[1]).toBe("123")
  })



})


